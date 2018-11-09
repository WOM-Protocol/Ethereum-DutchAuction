const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const constants = require('../../helpers/global.js');
const aConstants = require('./auctionGlobals.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('testAuction.js', function(accounts) {
	const END_TIME = (15 * constants.DAY_EPOCH);

	it('Grab needed deployed contracts', async () => {
		this.erc20Instance = await ERC20BurnableAndMintable.deployed();
		this.multiCertifierInstance = await MultiCertifier.deployed();
		this.tokenVestingInstance = await TokenVesting.deployed();
		this.auctionInstance = await SecondPriceAuction.deployed();
	});

	describe('catch whenActive modifier', () => {
		it('function - currentPrice()', async () => {
			await this.auctionInstance.currentPrice().catch(function(err){
	      assert.include(err.message,'VM Exception');
			});
		});

		it('function - tokensAvailable()', async () => {
			await this.auctionInstance.tokensAvailable().catch(function(err){
	      assert.include(err.message,'VM Exception');
	    });
		});

		it('function - maxPurchase()', async () => {
			await this.auctionInstance.maxPurchase().catch(function(err){
	      assert.include(err.message,'VM Exception');
	    });
		});

		it('function - bonus()', async () => {
			await this.auctionInstance.bonus(100).catch(function(err){
	      assert.include(err.message,'VM Exception');
	    });
		});

		it('function - theDeal()', async () => {
			await this.auctionInstance.theDeal(100).catch(function(err){
	      assert.include(err.message,'VM Exception');
	    });
		});
	});

	describe('start auction validation', () => {
		it('increaseTime by 1000', async () => {
			increaseTime(1000);
		});
		it('var - endTime set', async () => {
			assert.equal(await this.auctionInstance.endTime(), constants.BEGIN_TIME + END_TIME, 'END time set correctly');
		});
		it('function - isActive() TRUE', async () => {
			assert.equal(true, await this.auctionInstance.isActive(), 'Active auction');
		});
		it('function - allFinalised() false', async () => {
			assert.equal(false, await this.auctionInstance.allFinalised(), 'not finalized auction');
		});
		it('function - hoursPassed 0', async () => {
			assert.equal(0, await this.auctionInstance.hoursPassed(), 'no hours passed');
		});
		it('function - softCapMet() false', async () => {
			assert.equal(false, await this.auctionInstance.softCapMet(), 'soft cap not met');
		});
		it('function - currentPrice() 1USD', async () => {
			assert.equal(aConstants.USDWEI, Number(await this.auctionInstance.currentPrice()), 'Current price 1$');
		});
		it('function - tokensAvailable() AUCTION_CAP', async () => {
			assert.equal(constants.AUCTION_CAP, await this.auctionInstance.tokensAvailable(), 'full tokens available');
		});
		it('function - maxPurchase() 350mUSD', async () => {
			assert.equal(constants.AUCTION_CAP*aConstants.USDWEI, await this.auctionInstance.maxPurchase(), 'all tokens available for purchase');
		});
		it('function - currentBonus() 20', async () => {
			assert.equal(20, await this.auctionInstance.currentBonus(), 'Current bonus');
		});
		it('function - bonus() 20% bonus of 100 == 120', async () => {
			assert.equal(20, await this.auctionInstance.bonus(100), 'Bonus added correctly');
		});
		it('function - theDeal() 100, 20% bonus', async () => {
			let theDealRes = await this.auctionInstance.theDeal(100);
			assert.equal(120, theDealRes[0], 'deal added');
			assert.equal(false, theDealRes[1], 'no refund needed');
			assert.equal(aConstants.USDWEI, theDealRes[2], 'price still 1$');
		});
	});

	describe('End auction validation', () => {
		it('increaseTime to END_TIME', async () => {
			increaseTime(END_TIME);
		});
		it('function - isActive() FALSE', async () => {
			assert.equal(false, await this.auctionInstance.isActive(), 'Auction ended');
		});
		it('function - allFinalised() TRUE', async () => {
			assert.equal(true, await this.auctionInstance.allFinalised(), 'All finalized');
		});
	});
});
