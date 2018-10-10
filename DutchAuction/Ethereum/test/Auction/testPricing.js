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

contract('testPricing.js', function(accounts) {
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

	describe('Console log of prices', () => {
	  it('Day prices log', async () => {
	    increaseTime(1000);
	    console.log('Start Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 1 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 2 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 3 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 4 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 5 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 6 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 7 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 8 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 9 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 10 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 11 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 12 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 13 Price : ', Number(await this.auctionInstance.currentPrice()));
	    increaseTime(constants.DAY_EPOCH);
	    console.log('Day 14 Price : ', Number(await this.auctionInstance.currentPrice()));
	  });
	});
});
