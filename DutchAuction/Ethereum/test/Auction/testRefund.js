var util = require("ethereumjs-util");

const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');
const constants = require('../global.js');

const AssertRevert = require('../../helpers/AssertRevert.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('testContribution.js', function(accounts) {

  const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;
	const END_TIME = (15 * constants.DAY_EPOCH);

	const USDWEI = 4520000000000000; // In WEI at time of testing 26/09/18
	const TLCS = 'This is an example terms and conditions.';
	const DUST = 4000000000000000;


	const BONUS_20 = 1000000000000000000*1.2;
	const BONUS_15 = 1000000000000000000*1.15;
	const BONUS_10 = 1000000000000000000*1.1;
	const BONUS_5 = 1000000000000000000*1.05;
	const NO_BONUS = 1000000000000000000;


	let hashedMessage;
	let r;
	let s;
	let v;
	let vDecimal;

	let certifierHandlerInstance;
	let multiCertifierInstance;
	let auctionInstance;
	let erc20Instance;
  let tokenVestingInstance;

	it('Deploy Token', async () => {
		erc20Instance = await ERC20BurnableAndMintable.new(
			constants.TOKEN_SUPPLY, constants.TOKEN_NAME, 18, constants.TOKEN_SYMBOL);
	});

	it('Deply MultiCertifier', async () => {
		multiCertifierInstance = await MultiCertifier.new();
	});

  it('Deploy Token Vesting', async () => {
		tokenVestingInstance = await TokenVesting.new(erc20Instance.address);
	});

	it('Deploy && Start SecondPriceAuction', async () => {
		auctionInstance = await SecondPriceAuction.new(
			multiCertifierInstance.address,
			erc20Instance.address,
			tokenVestingInstance.address,
			constants.TREASURY,
			constants.ADMIN,
			BEGIN_TIME,
			constants.AUCTION_CAP);
	});

  it('sign & purchase & end', async () => {
    increaseTime(1000);
      // Sign message //
    const message = 'TLCS.'
    hashedMessage = web3.sha3(message)
    assert.equal(await auctionInstance.STATEMENT_HASH(), hashedMessage);
    var sig = await web3.eth.sign(constants.PARTICIPANT_ONE, hashedMessage).slice(2)
    r = '0x' + sig.slice(0, 64)
    s = '0x' + sig.slice(64, 128)
    v = web3.toDecimal(sig.slice(128, 130)) + 27
    assert.equal(await auctionInstance.isSigned(constants.PARTICIPANT_ONE, hashedMessage, v, r, s), true);
    assert.equal(await auctionInstance.recoverAddr(hashedMessage, v, r, s), constants.PARTICIPANT_ONE);

      // certify //
    await multiCertifierInstance.certify(constants.PARTICIPANT_ONE);

      // -- Buyin -- //
    await auctionInstance.buyin(v, r, s, {from:constants.PARTICIPANT_ONE, value: NO_BONUS});
    buyins = await auctionInstance.buyins(constants.PARTICIPANT_ONE);
    increaseTime(END_TIME);
	});

  it('Softcap not met', async () => {
    assert.equal(await auctionInstance.softCapMet(), false);

    let balanceBefore = Number(web3.eth.getBalance(constants.PARTICIPANT_ONE));
    await auctionInstance.claimRefund(constants.PARTICIPANT_ONE);
    assert.equal(Number(web3.eth.getBalance(constants.PARTICIPANT_ONE)),balanceBefore+NO_BONUS);
    assert.equal(Number(web3.eth.getBalance(auctionInstance.address)), 0);
  });
});
