const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const constants = require('../global.js');
const aConstants = require('./auctionGlobals.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
};

contract('testAdmin.js', function(accounts) {
	const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;
	const END_TIME = (15 * constants.DAY_EPOCH);

	describe('Deployment', () => {
    it('ERC20BurnableAndMintable', async () => {
			this.erc20Instance = await ERC20BurnableAndMintable.new(
				constants.TOKEN_SUPPLY, constants.TOKEN_NAME, 18, constants.TOKEN_SYMBOL);
    });

    it('MultiCertifier', async () => {
			this.multiCertifierInstance = await MultiCertifier.new();
    });

		it('TokenVesting', async () => {
			this.tokenVestingInstance = await TokenVesting.new(this.erc20Instance.address);
    });

		it('SecondPriceAuction', async () => {
			this.auctionInstance = await SecondPriceAuction.new(
				this.multiCertifierInstance.address,
				this.erc20Instance.address,
				this.tokenVestingInstance.address,
				constants.TREASURY,
				constants.ADMIN,
				BEGIN_TIME,
				constants.AUCTION_CAP);
		});
	});

	describe('function - inject()', () => {
    it('catch only_admin modifier', async () => {
			await this.auctionInstance.inject(constants.PARTICIPANT_ONE, 100, 15, {from:constants.PARTICIPANT_ONE}).catch(function(err){
	      assert.include(err.message,'VM Exception');
    	});
		});

    it('inject() PARTICIPANT_ONE 100 WEI 15% bonus', async () => {
			await this.auctionInstance.inject(constants.PARTICIPANT_ONE, 100, 15, {from:constants.ADMIN});
	    assert.equal(100, await this.auctionInstance.totalReceived(), 'Total recieved updated');
	    assert.equal(115, await this.auctionInstance.totalAccounted(), 'Total accounted updated');
	    let buyinsUser = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
	    assert.equal(115, buyinsUser[0], 'participant accounted updated');
	    assert.equal(100, buyinsUser[1], 'participant accounted updated');
	    assert.equal(true, buyinsUser[2], 'participant accounted updated');
    });
	});

	describe('function - uninject()', () => {
    it('catch only_admin modifier', async () => {
			await this.auctionInstance.uninject(constants.PARTICIPANT_ONE, {from:constants.PARTICIPANT_ONE}).catch(function(err){
	      assert.include(err.message,'VM Exception');
	    });
    });

    it('uninject() PARTICIPANT_ONE 100 WEI', async () => {
			await this.auctionInstance.uninject(constants.PARTICIPANT_ONE,{from:constants.ADMIN});
	    assert.equal(0, await this.auctionInstance.totalReceived(), 'Total recieved updated');
	    assert.equal(0, await this.auctionInstance.totalAccounted(), 'Total accounted updated');
	    let buyinsUser = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
	    assert.equal(0, buyinsUser[0], 'participant account deleted');
	    assert.equal(0, buyinsUser[1], 'participant account deleted');
	    assert.equal(false, buyinsUser[2], 'participant account deleted');
    });
	});

	describe('function - setHalted()', () => {
    it('catch only_admin modifier', async () => {
			await this.auctionInstance.setHalted(true, {from:constants.PARTICIPANT_ONE}).catch(function(err){
	      assert.include(err.message, 'VM Exception');
	    });
    });

    it('setHalted() TRUE by ADMIN', async () => {
			await this.auctionInstance.setHalted(true, {from:constants.ADMIN});
	    assert.equal(true, await this.auctionInstance.halted(), 'halted set');
    });

		it('setHalted() FALSE by ADMIN', async () => {
			await this.auctionInstance.setHalted(false, {from:constants.ADMIN});
			assert.equal(false, await this.auctionInstance.halted(), 'halted set');
    });
	});

	describe('function setUSDWei() + setUSDSoftCap', () => {
		it('increase time 100', async () => {
			increaseTime(1000);
		});

    it('setusdWEI() to 4521 szabo from ADMIN', async () => {
			await this.auctionInstance.setUSDWei(web3.toWei(4521,'szabo'), {from:constants.ADMIN});
			assert.equal(Number(await this.auctionInstance.usdWEI()),  web3.toWei(4521,'szabo'));
    });

		it('setUSDSoftCap() to 45201 ether from ADMIN', async () => {
			await this.auctionInstance.setUSDSoftCap(web3.toWei(45201,'ether'), {from:constants.ADMIN});
			assert.equal(Number(await this.auctionInstance.usdWEISoftCap()),  web3.toWei(45201,'ether'));
    });
	});

	describe('function setUSDWei() + setUSDSoftCap', () => {
		let r, s, v, hashedMessage, buyins;
		it('sign message', async () => {
			const message = 'TLCS.';
			hashedMessage = web3.sha3(message);
			assert.equal(await this.auctionInstance.STATEMENT_HASH(), hashedMessage);
			var sig = await web3.eth.sign(constants.PARTICIPANT_ONE, hashedMessage).slice(2);
			r = '0x' + sig.slice(0, 64);
			s = '0x' + sig.slice(64, 128);
			v = web3.toDecimal(sig.slice(128, 130)) + 27;
			assert.equal(await this.auctionInstance.isSigned(constants.PARTICIPANT_ONE, hashedMessage, v, r, s), true);
			assert.equal(await this.auctionInstance.recoverAddr(hashedMessage, v, r, s), constants.PARTICIPANT_ONE);
		});

		it('certify PARTICIPANT_ONE', async () => {
			await this.multiCertifierInstance.certify(constants.PARTICIPANT_ONE);
		});

		it('buyin from PARTICIPANT_ONE 1 ether', async () => {
			await this.auctionInstance.buyin(v, r, s, {from:constants.PARTICIPANT_ONE, value: aConstants.NO_BONUS});
			buyins = await this.auctionInstance.buyins(constants.PARTICIPANT_ONE);
		});

		it('increase time to END_TIME', async () => {
			increaseTime(END_TIME);
		});

		it('drain buyin value from PARTICIPANT_ONE', async () => {
			let balanceBefore = Number(web3.eth.getBalance(constants.TREASURY));
			assert.equal(await this.auctionInstance.isActive(), false);
			await this.auctionInstance.drain({from:constants.ADMIN});
			assert.equal(web3.eth.getBalance(this.auctionInstance.address), 0);
			assert.equal(Number(web3.eth.getBalance(constants.TREASURY)),aConstants.NO_BONUS+balanceBefore);
		});
	});
});
