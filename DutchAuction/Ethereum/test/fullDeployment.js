const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');
const Ownable = artifacts.require('./Ownable.sol');
const constants = require('../helpers/global.js');

contract('Full Deployment Test', function(accounts) {
	const END_TIME = constants.BEGIN_TIME + (15 * constants.DAY_EPOCH);

  describe('Ownable Contract', () => {
    it('deploys', async () => {
      this.ownableInstance = await Ownable.deployed();
    });

    it('initial assignment correct', async () => {
      assert.equal(await this.ownableInstance.owner(), constants.OWNER, 'Owner is correctly set');
    });
  });

  describe('Token Contract', () => {
    it('deploys', async () => {
      this.erc20Instance =  await ERC20BurnableAndMintable.deployed();
    });

    it('assignment correct', async () => {
      assert.equal(Number(await this.erc20Instance.balanceOf(constants.OWNER)), constants.TOKEN_SUPPLY, 'Initial amount assigned to creator');
      assert.equal(await this.erc20Instance.totalSupply(), constants.TOKEN_SUPPLY, 'Initial amount assigned to supply');
      assert.equal(await this.erc20Instance.name(), constants.TOKEN_NAME, 'Token name assigned');
      assert.equal(await this.erc20Instance.decimals(), constants.DECIMAL_UNITS, 'Decimal units assigned');
      assert.equal(await this.erc20Instance.symbol(), constants.TOKEN_SYMBOL, 'Token symbol assigned');
      assert.equal(await this.erc20Instance.owner(), constants.OWNER, 'Token owner assigned');
    });
  });


  describe('MultiCertifier Contract', () => {
    it('deploys', async () => {
      this.multiCertifierInstance = await MultiCertifier.deployed();
    });
  });


  describe('MultiCertifier Contract', () => {
    it('deploys', async () => {
      this.certifierHandlerInstance = await CertifierHandler.deployed(0)
    });

    it('initial assignment correct', async () => {
      assert.equal(await this.certifierHandlerInstance.treasury(), constants.TREASURY, 'TREASURY address assigned');
    });
  });


  describe('TokenVesting Contract', () => {
    it('deploys', async () => {
      this.tokenVestingInstance = await TokenVesting.deployed()
    });

    it('initial assignment correct', async () => {
      assert.equal(await this.tokenVestingInstance.tokenAddress(), this.erc20Instance.address, 'ERC20 token address assigned');
    });
  });


  describe('SecondPriceAuction Contract', () => {
    it('deploys', async () => {
      this.auctionInstance = await SecondPriceAuction.deployed();
    });

    it('initial assignment correct', async () => {
  		assert.equal(await this.auctionInstance.certifier(), this.multiCertifierInstance.address, 'MultiCertifier address set');
  		assert.equal(await this.auctionInstance.tokenContract(), this.erc20Instance.address, 'Token address set');
  		assert.equal(await this.auctionInstance.tokenVesting(), this.tokenVestingInstance.address, 'Token vesting address set');
  		assert.equal(await this.auctionInstance.treasury(), constants.TREASURY, 'Treasury address set');
  		assert.equal(await this.auctionInstance.admin(), constants.ADMIN, 'Admin address set');
  		assert.equal(await this.auctionInstance.beginTime(), constants.BEGIN_TIME, 'Begin time set');
  		assert.equal(await this.auctionInstance.tokenCap(), constants.AUCTION_CAP, 'Auction cap set');
  		assert.equal(await this.auctionInstance.endTime(), END_TIME, 'End time set');
    });
  });
});
