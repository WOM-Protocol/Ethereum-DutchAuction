const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');
const Ownable = artifacts.require('./Ownable.sol');
const SafeMath = artifacts.require('./SafeMath.sol');
const Migrations = artifacts.require('./Migrations.sol');
const constants = require('../helpers/global.js');

module.exports = function(deployer, accounts) {
  deployer.deploy(Migrations);
  deployer.deploy([SafeMath,Ownable]);
  deployer.link(SafeMath, [ERC20BurnableAndMintable, TokenVesting]);
  deployer.deploy([
    [ERC20BurnableAndMintable,
      constants.TOKEN_SUPPLY,
      constants.TOKEN_NAME,
      18,
      constants.TOKEN_SYMBOL],
    MultiCertifier]).then(function() {
      return deployer.deploy(CertifierHandler, MultiCertifier.address, constants.TREASURY)
    }).then(function() {
      return deployer.deploy(TokenVesting, ERC20BurnableAndMintable.address)
    }).then(function() {
      return deployer.deploy(SecondPriceAuction,
        MultiCertifier.address,
        ERC20BurnableAndMintable.address,
        TokenVesting.address,
        constants.TREASURY,
        constants.ADMIN,
        constants.BEGIN_TIME,
        constants.AUCTION_CAP)
    });
};
