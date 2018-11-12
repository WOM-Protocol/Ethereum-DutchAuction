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

	describe('fund less than softCap && increaseTime(END_TIME)', () => {
		it('sign message for buyin from PARTICIPANT_ONE', async () => {
			increaseTime(1000)
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

		it('Certify PARTICIPANT_ONE', async () => {
			await this.multiCertifierInstance.certify(constants.PARTICIPANT_ONE);
		});

		it('buyin less than softcap && end auction', async () => {
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: aConstants.NO_BONUS});
			buyins = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
			increaseTime(END_TIME);
		});
	});

	describe('claim refund', () => {
		it('function - claimRefund()', async () => {
			let balanceBefore = Number(web3.eth.getBalance(constants.PARTICIPANT_ONE));
			await this.auctionInstance.claimRefund(constants.PARTICIPANT_ONE);
			assert.equal(Number(web3.eth.getBalance(constants.PARTICIPANT_ONE)),balanceBefore+aConstants.NO_BONUS);
			assert.equal(Number(web3.eth.getBalance(this.auctionInstance.address)), 0);
		});
	});
});
