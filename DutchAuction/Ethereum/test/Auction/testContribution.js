var util = require("ethereumjs-util");

const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('test - auction', function(accounts) {
  const OWNER = accounts[0];
	const ADMIN = accounts[1];
  const TREASURY = accounts[2];
  const PARTICIPANT = accounts[5];
	const PARTICIPANT1 = accounts[6];

  const TRAILING_DECIMALS = 000000000000000000;
	const TOKEN_SUPPLY = 1000000000000000000000000000;
	const AUCTION_CAP = 350000000000000000000000000;
	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';
	const DECIMAL_UNITS = 18;

	const DAY_EPOCH = 86400;
	const WEEK_EPOCH = DAY_EPOCH*7;
	const HOUR_EPOCH = DAY_EPOCH/24;
  const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;
  const END_TIME = BEGIN_TIME + (15 * DAY_EPOCH);

	const USDWEI = 4685000000000000; // In WEI at time of testing 26/09/18
	const TLCS = 'This is an example terms and conditions.';
	const DUST = 4000000000000000;


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
			TOKEN_SUPPLY, TOKEN_NAME, 18, TOKEN_SYMBOL);
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
			TREASURY,
			ADMIN,
			BEGIN_TIME,
			AUCTION_CAP);
	});

  it('Sign statement hash', async () => {
		const message = 'TLCS.'
		hashedMessage = web3.sha3(message)
		assert.equal(await auctionInstance.STATEMENT_HASH(), hashedMessage);
		var sig = await web3.eth.sign(PARTICIPANT, hashedMessage).slice(2)
		r = '0x' + sig.slice(0, 64)
		s = '0x' + sig.slice(64, 128)
		v = web3.toDecimal(sig.slice(128, 130)) + 27
		assert.equal(await auctionInstance.isSigned(PARTICIPANT, hashedMessage, v, r, s), true);
		assert.equal(await auctionInstance.recoverAddr(hashedMessage, v, r, s), PARTICIPANT);
	});



	it('Purchase', async () => {
		/* ---- when_not_halted ---- */
		await auctionInstance.setHalted(true, {from:ADMIN});
		assert.equal(await auctionInstance.halted(), true);
		let when_not_halted = auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: 5000000000000000});
		AssertRevert.assertRevert(when_not_halted);

		/* ---- remove hault ---- */
		await auctionInstance.setHalted(false, {from:ADMIN});
		assert.equal(await auctionInstance.halted(), false);


		/* ---- not_pre_sale_member ---- */
		await auctionInstance.inject(PARTICIPANT, 10000, 10, {from:ADMIN});
		let buyinsUser = await auctionInstance.buyins(PARTICIPANT);
		assert.equal(buyinsUser[2], true);
		let not_pre_sale_member = auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: 5000000000000000});
		AssertRevert.assertRevert(not_pre_sale_member);
		await auctionInstance.uninject(PARTICIPANT, {from:ADMIN});
		buyinsUser = await auctionInstance.buyins(PARTICIPANT);
		assert.equal(buyinsUser[2], false);

		/* ---- when_active ---- */
		assert.equal(await auctionInstance.isActive(), false);
		let when_active = auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: 5000000000000000});
		AssertRevert.assertRevert(when_active);

		increaseTime(1000);
		assert.equal(Number(await auctionInstance.currentPrice()), USDWEI);

		/* ---- only_eligible ---- */
		let only_eligible_recoverAddr = auctionInstance.buyin(v+1, r, s, {from:PARTICIPANT, value: 5000000000000000});
		AssertRevert.assertRevert(only_eligible_recoverAddr);

		let only_eligible_certified = auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: 5000000000000000});
		AssertRevert.assertRevert(only_eligible_certified);
		await multiCertifierInstance.certify(PARTICIPANT);
		let certs = await multiCertifierInstance.certs(PARTICIPANT);
		assert.equal(certs[1], true);

		let only_eligible_dust = auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: DUST});
		AssertRevert.assertRevert(only_eligible_dust);

		await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: 1000000000000000000});
		buyins = await auctionInstance.buyins(PARTICIPANT);
		assert.equal(Number(buyins[0]), 1000000000000000000*1.2, 'user buyins accounted upated');
		assert.equal(Number(buyins[1]), 1000000000000000000, 'user buyins received upated');
		assert.equal(Number(await auctionInstance.totalAccounted()),1000000000000000000*1.2, 'total accounted updated');
		assert.equal(Number(await auctionInstance.totalReceived()), 1000000000000000000, 'total receieved updated');
	});
});
