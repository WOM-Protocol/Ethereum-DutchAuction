const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');
const constants = require('../../helpers/global.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('vesting.js', function(accounts) {

  const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;

  const END_TIME = (15 * constants.DAY_EPOCH);
  const YEAR_EPOCH = 31556926;
	const CLIFF_START = BEGIN_TIME + YEAR_EPOCH + END_TIME;

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
			constants.TOKEN_SUPPLY, constants.TOKEN_NAME, 18, constants.TOKEN_SYMBOL);
    multiCertifierInstance = await MultiCertifier.new();
    tokenVestingInstance = await TokenVesting.new(erc20Instance.address);
    auctionInstance = await SecondPriceAuction.new(
      multiCertifierInstance.address,
      erc20Instance.address,
      tokenVestingInstance.address,
      constants.TREASURY,
      constants.ADMIN,
      BEGIN_TIME,
      constants.AUCTION_CAP);

		await tokenVestingInstance.assignAuctionAddress(auctionInstance.address);
    assert.equal(await tokenVestingInstance.auctionAddress(), auctionInstance.address);
	});

  it('Admin register presalevest', async () => {
    await erc20Instance.transfer(auctionInstance.address, constants.AUCTION_CAP);
    assert.equal(await erc20Instance.balanceOf(auctionInstance.address), constants.AUCTION_CAP);


    /* ---- notEmptyUint ---- */
    let notEmptyUint = tokenVestingInstance.registerPresaleVest(constants.PARTICIPANT_PRESALE, CLIFF_START, 0, 25);
    AssertRevert.assertRevert(notEmptyUint);

    /* ---- notEmptyAddress ---- */
    let notEmptyAddress = tokenVestingInstance.registerPresaleVest(constants.EMPTY_ADDRESS, CLIFF_START, YEAR_EPOCH, 25);
    AssertRevert.assertRevert(notEmptyAddress);


    await tokenVestingInstance.registerPresaleVest(constants.PARTICIPANT_PRESALE, CLIFF_START, YEAR_EPOCH, 25);
    let users = await tokenVestingInstance.users(constants.PARTICIPANT_PRESALE);
    assert.equal(users[0], CLIFF_START);
    assert.equal(users[1], YEAR_EPOCH);
    assert.equal(users[2], 25);

    /* ---- notRegistered ---- */
    let notRegistered = tokenVestingInstance.registerPresaleVest(constants.PARTICIPANT_PRESALE, CLIFF_START, YEAR_EPOCH, 25);
    AssertRevert.assertRevert(notRegistered);
    await auctionInstance.inject(constants.PARTICIPANT_PRESALE, PRESALE_PURCHASE, 15, {from:constants.ADMIN});
    console.log('total accounted: ', Number(await auctionInstance.totalAccounted()));
  //  console.log('eth to wei: ', Number(web3.toWei(35971,'ether')));

  });

  it('Participation of normal user', async () => {
    increaseTime(1000);
    const message = 'TLCS.'
    let hashedMessage = web3.sha3(message)
    assert.equal(await auctionInstance.STATEMENT_HASH(), hashedMessage);
    var sig = await web3.eth.sign(constants.PARTICIPANT_ONE, hashedMessage).slice(2)
    r = '0x' + sig.slice(0, 64)
    s = '0x' + sig.slice(64, 128)
    v = web3.toDecimal(sig.slice(128, 130)) + 27
    assert.equal(await auctionInstance.isSigned(constants.PARTICIPANT_ONE, hashedMessage, v, r, s), true);
    assert.equal(await auctionInstance.recoverAddr(hashedMessage, v, r, s), constants.PARTICIPANT_ONE);

    await multiCertifierInstance.certify(constants.PARTICIPANT_ONE);
  	await auctionInstance.buyin(v, r, s, {from:constants.PARTICIPANT_ONE, value: PARTICIPANT_PURCHASE});

  });

	it('Set time ended', async () => {
		increaseTime(END_TIME);
		assert.equal(await auctionInstance.isActive(), false);
		assert.equal(await auctionInstance.softCapMet(), true);
  });

  it('Finalize as the pre-sale participant', async () => {
		let presaleBuyins = await auctionInstance.buyins(constants.PARTICIPANT_PRESALE);
    await auctionInstance.finalise(constants.PARTICIPANT_ONE);
    await auctionInstance.finalise(constants.PARTICIPANT_PRESALE);
		assert.equal(await auctionInstance.isFinalized(), true);

		let tokenCap = Number(await auctionInstance.tokenCap());
		let perEach = Number(tokenCap / (PRESALE_PURCHASE_WITH_BONUS + PARTICIPANT_PURCHASE_WITH_BONUS));
		let presaleAmount = Number(perEach * PRESALE_PURCHASE_WITH_BONUS);
		let participantAmount = Number(perEach * PARTICIPANT_PURCHASE_WITH_BONUS);

		let participantBalance = Number(await erc20Instance.balanceOf(constants.PARTICIPANT_ONE));
		let presaleBalance = Number(await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address));

		assert.notEqual(presaleBalance, 0);
		assert.notEqual(participantBalance, 0);
  });

	it('Token Vesting has recieved approval', async () => {
		let presaleBalance = Number(await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address));
		let usersVest = await tokenVestingInstance.users(constants.PARTICIPANT_PRESALE);

		let shouldBeCliffRelease = presaleBalance * 0.25;
		let shouldBePaymentPerMonth = (presaleBalance - shouldBeCliffRelease) / (12);

		assert.equal(Number(usersVest[3]), shouldBeCliffRelease);
		assert.equal(Number(usersVest[4]), shouldBePaymentPerMonth);
		assert.equal(Number(usersVest[5]), presaleBalance);
		assert.equal(Number(usersVest[7]), presaleBalance);
	});

	it('Release tokens - Cliff', async () => {
		/* ---- isRegistered ---- */
		let isRegistered = tokenVestingInstance.release({from:constants.PARTICIPANT_ONE});
		AssertRevert.assertRevert(isRegistered);

		/* ---- require_now_start ---- */
	//	let require_now_start = tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
	//	AssertRevert.assertRevert(require_now_start);

		increaseTime(YEAR_EPOCH+constants.DAY_EPOCH);
		await tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
		let users = await tokenVestingInstance.users(constants.PARTICIPANT_PRESALE);
		assert.equal(Number(users[3]), Number(await erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE)));
		assert.equal(Number(users[5]), Number(users[7]) - Number(users[3]));
		assert.equal(Number(users[6]), Number(users[3]));
		assert.equal(Number(users[8]), 1);
		assert.equal(users[9], true);
	});

  it('Admin Functonality', async () => {
    /* ---- require(auctionAddress == address(0)); ---- */
    let require_address_0 = tokenVestingInstance.assignAuctionAddress(auctionInstance.address,{from:constants.OWNER});
    AssertRevert.assertRevert(require_address_0);

    let not_locked = tokenVestingInstance.emergencyDrain(constants.EMERGENCY_ADDRESS);
    AssertRevert.assertRevert(not_locked);

    await tokenVestingInstance.setLock(true, {from:constants.OWNER});
    assert.equal(await tokenVestingInstance.locked(), true);

    let locked = tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
    AssertRevert.assertRevert(locked);

    let balanceBefore = await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address);

    await tokenVestingInstance.emergencyDrain(constants.EMERGENCY_ADDRESS);
    assert.equal(await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address), 0);
    assert.equal(Number(await erc20Instance.balanceOf(constants.EMERGENCY_ADDRESS)), Number(balanceBefore));
  });

});
