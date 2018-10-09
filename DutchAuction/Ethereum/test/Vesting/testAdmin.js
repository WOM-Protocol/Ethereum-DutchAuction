const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('vesting.js', function(accounts) {
  const OWNER = accounts[0];
	const ADMIN = accounts[1];
  const TREASURY = accounts[2];
  const PARTICIPANT= accounts[5];
  const PRESALE_PARTICIPANT= accounts[6];
  const EMERGENCY_ADDRESS = accounts[9];


  const TRAILING_DECIMALS = 000000000000000000;
	const TOKEN_SUPPLY = 1000000000000000000000000000;
	const AUCTION_CAP = 350000000000000000000000000;

	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';
	const DECIMAL_UNITS = 18;

	const DAY_EPOCH = 86400;
	const MONTH_EPOCH = 2629743;
  const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;

  const END_TIME = (15 * DAY_EPOCH);
  const YEAR_EPOCH = 31556926;
	const CLIFF_START = BEGIN_TIME + YEAR_EPOCH + END_TIME;

  const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

	const PARTICIPANT_PURCHASE = web3.toWei(10,'ether');
	const PARTICIPANT_PURCHASE_WITH_BONUS = Number(PARTICIPANT_PURCHASE * 1.2);

	const PRESALE_PURCHASE = web3.toWei(45190,'ether');
	const PRESALE_PURCHASE_WITH_BONUS = Number(PRESALE_PURCHASE * 1.15);

  let hashedMessage;
  let r;
  let s;
  let v;

	let certifierHandlerInstance;
	let multiCertifierInstance;
	let auctionInstance;
	let erc20Instance;
  let tokenVestingInstance;

	it('Deploy contracts', async () => {
		erc20Instance = await ERC20BurnableAndMintable.new(
			TOKEN_SUPPLY, TOKEN_NAME, 18, TOKEN_SYMBOL);
    multiCertifierInstance = await MultiCertifier.new();
    tokenVestingInstance = await TokenVesting.new(erc20Instance.address);
    auctionInstance = await SecondPriceAuction.new(
      multiCertifierInstance.address,
      erc20Instance.address,
      tokenVestingInstance.address,
      TREASURY,
      ADMIN,
      BEGIN_TIME,
      AUCTION_CAP);

		await tokenVestingInstance.assignAuctionAddress(auctionInstance.address);
    assert.equal(await tokenVestingInstance.auctionAddress(), auctionInstance.address);
	});

  it('Admin register presalevest', async () => {
    await erc20Instance.transfer(auctionInstance.address, AUCTION_CAP);
    assert.equal(await erc20Instance.balanceOf(auctionInstance.address), AUCTION_CAP);


    /* ---- notEmptyUint ---- */
    let notEmptyUint = tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, CLIFF_START, 0, 25);
    AssertRevert.assertRevert(notEmptyUint);

    /* ---- notEmptyAddress ---- */
    let notEmptyAddress = tokenVestingInstance.registerPresaleVest(EMPTY_ADDRESS, CLIFF_START, YEAR_EPOCH, 25);
    AssertRevert.assertRevert(notEmptyAddress);


    await tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, CLIFF_START, YEAR_EPOCH, 25);
    let users = await tokenVestingInstance.users(PRESALE_PARTICIPANT);
    assert.equal(users[0], CLIFF_START);
    assert.equal(users[1], YEAR_EPOCH);
    assert.equal(users[2], 25);

    /* ---- notRegistered ---- */
    let notRegistered = tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, CLIFF_START, YEAR_EPOCH, 25);
    AssertRevert.assertRevert(notRegistered);
    await auctionInstance.inject(PRESALE_PARTICIPANT, PRESALE_PURCHASE, 15, {from:ADMIN});
    console.log('total accounted: ', Number(await auctionInstance.totalAccounted()));
  //  console.log('eth to wei: ', Number(web3.toWei(35971,'ether')));

  });

  it('Participation of normal user', async () => {
    increaseTime(1000);
    const message = 'TLCS.'
    let hashedMessage = web3.sha3(message)
    assert.equal(await auctionInstance.STATEMENT_HASH(), hashedMessage);
    var sig = await web3.eth.sign(PARTICIPANT, hashedMessage).slice(2)
    r = '0x' + sig.slice(0, 64)
    s = '0x' + sig.slice(64, 128)
    v = web3.toDecimal(sig.slice(128, 130)) + 27
    assert.equal(await auctionInstance.isSigned(PARTICIPANT, hashedMessage, v, r, s), true);
    assert.equal(await auctionInstance.recoverAddr(hashedMessage, v, r, s), PARTICIPANT);

    await multiCertifierInstance.certify(PARTICIPANT);
  	await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: PARTICIPANT_PURCHASE});

  });

	it('Set time ended', async () => {
		increaseTime(END_TIME);
		assert.equal(await auctionInstance.isActive(), false);
		assert.equal(await auctionInstance.softCapMet(), true);
  });

  it('Finalize as the pre-sale participant', async () => {
		let presaleBuyins = await auctionInstance.buyins(PRESALE_PARTICIPANT);
    await auctionInstance.finalise(PARTICIPANT);
    await auctionInstance.finalise(PRESALE_PARTICIPANT);
		assert.equal(await auctionInstance.isFinalized(), true);

		let tokenCap = Number(await auctionInstance.tokenCap());
		let perEach = Number(tokenCap / (PRESALE_PURCHASE_WITH_BONUS + PARTICIPANT_PURCHASE_WITH_BONUS));
		let presaleAmount = Number(perEach * PRESALE_PURCHASE_WITH_BONUS);
		let participantAmount = Number(perEach * PARTICIPANT_PURCHASE_WITH_BONUS);

		let participantBalance = Number(await erc20Instance.balanceOf(PARTICIPANT));
		let presaleBalance = Number(await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address));

		assert.notEqual(presaleBalance, 0);
		assert.notEqual(participantBalance, 0);
  });

	it('Token Vesting has recieved approval', async () => {
		let presaleBalance = Number(await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address));
		let usersVest = await tokenVestingInstance.users(PRESALE_PARTICIPANT);

		let shouldBeCliffRelease = presaleBalance * 0.25;
		let shouldBePaymentPerMonth = (presaleBalance - shouldBeCliffRelease) / (12);

		assert.equal(Number(usersVest[3]), shouldBeCliffRelease);
		assert.equal(Number(usersVest[4]), shouldBePaymentPerMonth);
		assert.equal(Number(usersVest[5]), presaleBalance);
		assert.equal(Number(usersVest[7]), presaleBalance);
	});

	it('Release tokens - Cliff', async () => {
		/* ---- isRegistered ---- */
		let isRegistered = tokenVestingInstance.release({from:PARTICIPANT});
		AssertRevert.assertRevert(isRegistered);

		/* ---- require_now_start ---- */
	//	let require_now_start = tokenVestingInstance.release({from:PRESALE_PARTICIPANT});
	//	AssertRevert.assertRevert(require_now_start);

		increaseTime(YEAR_EPOCH+DAY_EPOCH);
		await tokenVestingInstance.release({from:PRESALE_PARTICIPANT});
		let users = await tokenVestingInstance.users(PRESALE_PARTICIPANT);
		assert.equal(Number(users[3]), Number(await erc20Instance.balanceOf(PRESALE_PARTICIPANT)));
		assert.equal(Number(users[5]), Number(users[7]) - Number(users[3]));
		assert.equal(Number(users[6]), Number(users[3]));
		assert.equal(Number(users[8]), 1);
		assert.equal(users[9], true);
	});

  it('Admin Functonality', async () => {
    /* ---- require(auctionAddress == address(0)); ---- */
    let require_address_0 = tokenVestingInstance.assignAuctionAddress(auctionInstance.address,{from:OWNER});
    AssertRevert.assertRevert(require_address_0);

    let not_locked = tokenVestingInstance.emergencyDrain(EMERGENCY_ADDRESS);
    AssertRevert.assertRevert(not_locked);

    await tokenVestingInstance.setLock(true, {from:OWNER});
    assert.equal(await tokenVestingInstance.locked(), true);

    let locked = tokenVestingInstance.release({from:PRESALE_PARTICIPANT});
    AssertRevert.assertRevert(locked);

    let balanceBefore = await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address);

    await tokenVestingInstance.emergencyDrain(EMERGENCY_ADDRESS);
    assert.equal(await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address), 0);
    assert.equal(Number(await erc20Instance.balanceOf(EMERGENCY_ADDRESS)), Number(balanceBefore));
  });

});
