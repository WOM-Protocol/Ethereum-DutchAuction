const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');
const constants = require('../../helpers/global.js');
const aConstants = require('./auctionGlobals.js');
const util = require("ethereumjs-util");

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('testContribution.js', function(accounts) {
	const END_TIME = (15 * constants.DAY_EPOCH);

	it('Grab needed deployed contracts', async () => {
		this.erc20Instance = await ERC20BurnableAndMintable.deployed();
		this.multiCertifierInstance = await MultiCertifier.deployed();
		this.tokenVestingInstance = await TokenVesting.deployed();
		this.auctionInstance = await SecondPriceAuction.deployed();

	});

	describe('function - buyin()', () => {
		it('sign message for buyin from PARTICIPANT_ONE', async () => {
			const message = 'TLCS.'
			hashedMessage = web3.sha3(message)
			assert.equal(await this.auctionInstance.STATEMENT_HASH(), hashedMessage);
			var sig = await web3.eth.sign(constants.PARTICIPANT_ONE, hashedMessage).slice(2)
			this.r = '0x' + sig.slice(0, 64)
			this.s = '0x' + sig.slice(64, 128)
			this.v = web3.toDecimal(sig.slice(128, 130)) + 27
			assert.equal(await this.auctionInstance.isSigned(constants.PARTICIPANT_ONE, hashedMessage, this.v, this.r, this.s), true);
			assert.equal(await this.auctionInstance.recoverAddr(hashedMessage, this.v, this.r, this.s), constants.PARTICIPANT_ONE);
		});

		it('catch whenNotHalted modifier', async () => {
			await this.auctionInstance.setHalted(true, {from:constants.ADMIN});
			assert.equal(await this.auctionInstance.halted(), true);
			let whenNotHalted = this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: 5000000000000000});
			AssertRevert.assertRevert(whenNotHalted);
			await this.auctionInstance.setHalted(false, {from:constants.ADMIN});
			assert.equal(await this.auctionInstance.halted(), false);
		});

		it('catch notPreSaleMember modifier', async () => {
			await this.auctionInstance.inject(constants.PARTICIPANT_ONE, 10000, 10, {from:constants.ADMIN});
			let buyinsUser = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			assert.equal(buyinsUser[2], true);
			let notPreSaleMember = this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: 5000000000000000});
			AssertRevert.assertRevert(notPreSaleMember);
			await this.auctionInstance.uninject(constants.PARTICIPANT_ONE, {from:constants.ADMIN});
			buyinsUser = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			assert.equal(buyinsUser[2], false);
		});

		it('catch whenActive modifier', async () => {
			assert.equal(await this.auctionInstance.isActive(), false);
			let whenActive = this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: 5000000000000000});
			AssertRevert.assertRevert(whenActive);
		});

		it('increase time so auction starts', async () => {
			increaseTime(1000);
			assert.equal(Number(await this.auctionInstance.currentPrice()), aConstants.USDWEI);
		});

		it('catch onlyEligible modifier', async () => {
			let onlyEligible_recoverAddr = this.auctionInstance.buyin(this.v+1, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: 5000000000000000});
			AssertRevert.assertRevert(onlyEligible_recoverAddr);
		});

		it('catch onlyEligible recoverAddr() modifier', async () => {
			let onlyEligible_recoverAddr = this.auctionInstance.buyin(this.v+1, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: 5000000000000000});
			AssertRevert.assertRevert(onlyEligible_recoverAddr);
		});

		it('catch onlyEligible certified() modifier', async () => {
			let onlyEligible_certified = this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: 5000000000000000});
			AssertRevert.assertRevert(onlyEligible_certified);
			await this.multiCertifierInstance.certify(constants.PARTICIPANT_ONE);
			let certs = await this.multiCertifierInstance.certs(constants.PARTICIPANT_ONE);
			assert.equal(certs[1], true);
		});

		it('catch onlyEligible dust() modifier', async () => {
			let onlyEligible_dust = this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: this.DUST});
			AssertRevert.assertRevert(onlyEligible_dust);
		});

		it('function eligibleCall()', async () => {
			assert.equal(await this.auctionInstance.eligibleCall(constants.PARTICIPANT_ONE, this.v, this.r, this.s), true);
		});
	});

	describe('function buyin() bonus rounds', () => {
		it('20% bonus effective', async () => {
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: aConstants.NO_BONUS});
			buyins = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			assert.equal(Number(buyins[0]), aConstants.BONUS_20, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), aConstants.NO_BONUS, 'user buyins received upated');
			assert.equal(Number(await this.auctionInstance.totalAccounted()), aConstants.BONUS_20, 'total accounted updated');
			assert.equal(Number(await this.auctionInstance.totalReceived()), aConstants.NO_BONUS, 'total receieved updated');
		});

		it('15% bonus effective', async () => {
			increaseTime(constants.DAY_EPOCH);
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: aConstants.NO_BONUS});
			assert.equal(Number(await this.auctionInstance.currentBonus()), 15);
			assert.equal(Number(await this.auctionInstance.currentBonusRound()), 2, 'bonus round updated');
			let buyins = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			assert.equal(Number(buyins[0]), aConstants.BONUS_20+aConstants.BONUS_15, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), aConstants.NO_BONUS*2, 'user buyins received upated');
			assert.equal(Number(await this.auctionInstance.totalAccounted()), aConstants.BONUS_20+aConstants.BONUS_15, 'total accounted updated');
			assert.equal(Number(await this.auctionInstance.totalReceived()), aConstants.NO_BONUS*2, 'total receieved updated');
		});

		it('10% bonus effective', async () => {
			increaseTime(constants.DAY_EPOCH);
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: aConstants.NO_BONUS});
			assert.equal(Number(await this.auctionInstance.currentBonus()), 10);
			assert.equal(Number(await this.auctionInstance.currentBonusRound()), 3, 'bonus round updated');
			buyins = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			assert.equal(Number(buyins[0]), aConstants.BONUS_20+aConstants.BONUS_15+aConstants.BONUS_10, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), aConstants.NO_BONUS*3, 'user buyins received upated');
			assert.equal(Number(await this.auctionInstance.totalAccounted()), aConstants.BONUS_20+aConstants.BONUS_15+aConstants.BONUS_10, 'total accounted updated');
			assert.equal(Number(await this.auctionInstance.totalReceived()), aConstants.NO_BONUS*3, 'total receieved updated');
		});

		it('5% bonus effective', async () => {
			increaseTime(constants.DAY_EPOCH);
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: aConstants.NO_BONUS});
			assert.equal(Number(await this.auctionInstance.currentBonus()), 5);
			assert.equal(Number(await this.auctionInstance.currentBonusRound()), 4, 'bonus round updated');
			buyins = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			assert.equal(Number(buyins[0]), aConstants.BONUS_20+aConstants.BONUS_15+aConstants.BONUS_10+aConstants.BONUS_5, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), aConstants.NO_BONUS*4, 'user buyins received upated');
			assert.equal(Number(await this.auctionInstance.totalAccounted()), aConstants.BONUS_20+aConstants.BONUS_15+aConstants.BONUS_10+aConstants.BONUS_5, 'total accounted updated');
			assert.equal(Number(await this.auctionInstance.totalReceived()), aConstants.NO_BONUS*4, 'total receieved updated');
		});

		it('0% bonus effective', async () => {
			increaseTime(constants.DAY_EPOCH);
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: aConstants.NO_BONUS});
			assert.equal(Number(await this.auctionInstance.currentBonus()), 0);
			assert.equal(Number(await this.auctionInstance.currentBonusRound()), 5, 'bonus round updated');
			buyins = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			assert.equal(Number(buyins[0]), aConstants.BONUS_20+aConstants.BONUS_15+aConstants.BONUS_10+aConstants.BONUS_5+aConstants.NO_BONUS, 'user buyins accounted upated');
			assert.equal(Number(buyins[1]), aConstants.NO_BONUS*5, 'user buyins received upated');
			assert.equal(Number(await this.auctionInstance.totalAccounted()), aConstants.BONUS_20+aConstants.BONUS_15+aConstants.BONUS_10+aConstants.BONUS_5+aConstants.NO_BONUS, 'total accounted updated');
			assert.equal(Number(await this.auctionInstance.totalReceived()), aConstants.NO_BONUS*5, 'total receieved updated');
		});

		it('Catch require(!refund) fund over token availability', async () => {
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: web3.toWei(1635284,'ether')}).catch(function(err){
				assert.include(err.message,'assert.fail');
			});
		});
	});


	describe('Ending of auction', () => {
		it('function - buyin() fund softcap', async () => {
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: web3.toWei(35970,'ether')});
			assert.equal(await this.auctionInstance.softCapMet(), true);
		});

		it('increase time to END_TIME', async () => {
			increaseTime(END_TIME);
			assert.equal(await this.auctionInstance.isActive(), false);
			await this.erc20Instance.transfer(this.auctionInstance.address, constants.AUCTION_CAP);
			assert.equal(await this.erc20Instance.balanceOf(this.auctionInstance.address), constants.AUCTION_CAP);		});

		it('function - finalise() & check transfer values', async () => {
			let buyin = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			await this.auctionInstance.finalise(constants.PARTICIPANT_ONE);
			assert.equal(await this.erc20Instance.balanceOf(constants.PARTICIPANT_ONE), constants.AUCTION_CAP);
			assert.equal(await this.erc20Instance.balanceOf(this.auctionInstance.address), 0);
		});
	});
});
