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


  const TRAILING_DECIMALS = 000000000000000000;
	const TOKEN_SUPPLY = 1000000000000000000000000000;
	const AUCTION_CAP = 350000000000000000000000000;
	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';
	const DECIMAL_UNITS = 18;

	const DAY_EPOCH = 86400;
  const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;
  const END_TIME = BEGIN_TIME + (15 * DAY_EPOCH);
  const YEAR_EPOCH = DAY_EPOCH*365;

  const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

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
	});

  it('Admin register presalevest', async () => {
    await erc20Instance.transfer(auctionInstance.address, AUCTION_CAP);
    assert.equal(await erc20Instance.balanceOf(auctionInstance.address), AUCTION_CAP);


    /* ---- notEmptyUint ---- */
    let notEmptyUint = tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, 0, YEAR_EPOCH+END_TIME, 2*YEAR_EPOCH);
    AssertRevert.assertRevert(notEmptyUint);

    /* ---- notEmptyAddress ---- */
    let notEmptyAddress = tokenVestingInstance.registerPresaleVest(EMPTY_ADDRESS, YEAR_EPOCH, YEAR_EPOCH+END_TIME, 2*YEAR_EPOCH);
    AssertRevert.assertRevert(notEmptyAddress);

    /* ---- require(_cliff <= _duration); ---- */
    let require_cliff = tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, 2*YEAR_EPOCH, YEAR_EPOCH+END_TIME, YEAR_EPOCH);
    AssertRevert.assertRevert(require_cliff);

    await tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, YEAR_EPOCH, YEAR_EPOCH+END_TIME, 2*YEAR_EPOCH);
    let users = await tokenVestingInstance.users(PRESALE_PARTICIPANT);
    assert.equal(users[0], YEAR_EPOCH+END_TIME);
    assert.equal(users[1], YEAR_EPOCH);
    assert.equal(users[2], 2*YEAR_EPOCH);

    /* ---- notRegistered ---- */
    let notRegistered = tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, YEAR_EPOCH, YEAR_EPOCH+END_TIME, 2*YEAR_EPOCH);
    AssertRevert.assertRevert(notRegistered);
    await auctionInstance.inject(PRESALE_PARTICIPANT, web3.toWei(45190,'ether'), 15, {from:ADMIN});
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
  	await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: web3.toWei(10,'ether')});

  });

  it('Set time ended & transfer funds to auction', async () => {
    console.log('CurrentPrice: ',Number(await auctionInstance.currentPrice()));
  	increaseTime(DAY_EPOCH);
		console.log('CurrentPrice: ',Number(await auctionInstance.currentPrice()));
		increaseTime(END_TIME);
		assert.equal(await auctionInstance.isActive(), false);
		assert.equal(await auctionInstance.softCapMet(), true);
  });

  it('Finalize as the pre-sale participant', async () => {



    //await auctionInstance.finalise(PARTICIPANT);
    await auctionInstance.finalise(PRESALE_PARTICIPANT);

    let endPrice = Number(await auctionInstance.endPrice());
    console.log('endPrice: ', endPrice);
    console.log('approval amount: ', parseFloat(await erc20Instance.allowance(auctionInstance.address, tokenVestingInstance.address)));
    console.log('balance auction: ', Number(await erc20Instance.balanceOf(auctionInstance.address)));
    console.log('balance participant: ', Number(await erc20Instance.balanceOf(PARTICIPANT)));
    console.log('total finalized: ', Number(await auctionInstance.totalFinalised()));
    console.log('auction cap: ', Number(await auctionInstance.tokenCap()));
		//console.log('Finalized bool: ', await auctionInstance.finalizedBool());


    //assert.equal(Number(await auctionInstance.totalFinalised()), AUCTION_CAP);

    //assert.equal(await erc20Instance.allowance(auctionInstance.address, PRESALE_PARTICIPANT), AUCTION_CAP);
    //console.log('After');


  });

});
