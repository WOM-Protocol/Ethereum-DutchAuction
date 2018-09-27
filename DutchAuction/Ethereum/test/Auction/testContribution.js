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

contract('testContribution.js', function(accounts) {
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

	const USDWEI = 4650000000000000; // In WEI at time of testing 26/09/18
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

		assert.equal(await auctionInstance.eligibleCall(PARTICIPANT, v, r, s), true);

		/* ---- 20% bonus ---- */
		await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: NO_BONUS});
		buyins = await auctionInstance.buyins(PARTICIPANT);
		assert.equal(Number(buyins[0]), BONUS_20, 'user buyins accounted upated');
		assert.equal(Number(buyins[1]), NO_BONUS, 'user buyins received upated');
		assert.equal(Number(await auctionInstance.totalAccounted()), BONUS_20, 'total accounted updated');
		assert.equal(Number(await auctionInstance.totalReceived()), NO_BONUS, 'total receieved updated');
	});

	it('Purchase bonuses', async () => {
			/* ---- 15% bonus ---- */
			increaseTime(DAY_EPOCH);
			await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: NO_BONUS});
			assert.equal(Number(await auctionInstance.currentBonus()), 15);
			assert.equal(Number(await auctionInstance.currentBonusRound()), 2, 'bonus round updated');
			let buyins = await auctionInstance.buyins(PARTICIPANT);
			assert.equal(Number(buyins[0]), BONUS_20+BONUS_15, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), NO_BONUS*2, 'user buyins received upated');
			assert.equal(Number(await auctionInstance.totalAccounted()), BONUS_20+BONUS_15, 'total accounted updated');
			assert.equal(Number(await auctionInstance.totalReceived()), NO_BONUS*2, 'total receieved updated');

			/* ---- 10% bonus ---- */
			increaseTime(DAY_EPOCH);
			await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: NO_BONUS});
			assert.equal(Number(await auctionInstance.currentBonus()), 10);
			assert.equal(Number(await auctionInstance.currentBonusRound()), 3, 'bonus round updated');
			buyins = await auctionInstance.buyins(PARTICIPANT);
			assert.equal(Number(buyins[0]), BONUS_20+BONUS_15+BONUS_10, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), NO_BONUS*3, 'user buyins received upated');
			assert.equal(Number(await auctionInstance.totalAccounted()), BONUS_20+BONUS_15+BONUS_10, 'total accounted updated');
			assert.equal(Number(await auctionInstance.totalReceived()), NO_BONUS*3, 'total receieved updated');

			/* ---- 5% bonus ---- */
			increaseTime(DAY_EPOCH);
			await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: NO_BONUS});
			assert.equal(Number(await auctionInstance.currentBonus()), 5);
			assert.equal(Number(await auctionInstance.currentBonusRound()), 4, 'bonus round updated');
			buyins = await auctionInstance.buyins(PARTICIPANT);
			assert.equal(Number(buyins[0]), BONUS_20+BONUS_15+BONUS_10+BONUS_5, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), NO_BONUS*4, 'user buyins received upated');
			assert.equal(Number(await auctionInstance.totalAccounted()), BONUS_20+BONUS_15+BONUS_10+BONUS_5, 'total accounted updated');
			assert.equal(Number(await auctionInstance.totalReceived()), NO_BONUS*4, 'total receieved updated');

			/* ---- 0% bonus ---- */
			increaseTime(DAY_EPOCH);
			await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: NO_BONUS});
			assert.equal(Number(await auctionInstance.currentBonus()), 0);
			assert.equal(Number(await auctionInstance.currentBonusRound()), 5, 'bonus round updated');
			buyins = await auctionInstance.buyins(PARTICIPANT);
			assert.equal(Number(buyins[0]), BONUS_20+BONUS_15+BONUS_10+BONUS_5+NO_BONUS, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), NO_BONUS*5, 'user buyins received upated');
			assert.equal(Number(await auctionInstance.totalAccounted()), BONUS_20+BONUS_15+BONUS_10+BONUS_5+NO_BONUS, 'total accounted updated');
			assert.equal(Number(await auctionInstance.totalReceived()), NO_BONUS*5, 'total receieved updated');

				/* ---- require (!refund); ---- */
						  // Fund over amount //
				await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: web3.toWei(1635284,'ether')}).catch(function(err){
		      assert.include(err.message,'assert.fail');
		    });
	});

	it('Meet softcap, then end auction', async () => {
			await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: web3.toWei(35970,'ether')});
			assert.equal(await auctionInstance.softCapMet(), true);

			increaseTime(END_TIME);
			assert.equal(await auctionInstance.isActive(), false);
			await erc20Instance.transfer(auctionInstance.address, AUCTION_CAP);
			assert.equal(await erc20Instance.balanceOf(auctionInstance.address), AUCTION_CAP);
	});

	it('Finalize', async () => {
		let buyin = await auctionInstance.buyins(PARTICIPANT);
		console.log(buyin[0], buyin[1], Number(buyin[2]));

		await auctionInstance.finalise(PARTICIPANT);
		assert.equal(await erc20Instance.balanceOf(PARTICIPANT), AUCTION_CAP);
		assert.equal(await erc20Instance.balanceOf(auctionInstance.address), 0);
	});
});
