const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const AssertRevert = require('../helpers/AssertRevert.js');
const AssertJump = require('../helpers/AssertJump.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('test - auction', function(accounts) {
  const OWNER = accounts[0];
	const ADMIN = accounts[1];
  const TREASURY = accounts[2];
  const PARTICIPANT1 = accounts[3];
	const PARTICIPANT2 = accounts[4];
  const PARTICIPANT3 = accounts[5];

  const TRAILING_DECIMALS = 000000000000000000;
	const TOKEN_SUPPLY = 1000000000000000000000000000;
	const AUCTION_CAP = 350000000000000000000000000;
	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';
	const DECIMAL_UNITS = 18;

	const DAY_EPOCH = 86400;
	const HOUR_EPOCH = DAY_EPOCH/24;
  const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;
  const END_TIME = BEGIN_TIME + (15 * DAY_EPOCH);


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

	it('Deply SecondPriceAuction', async () => {
		auctionInstance = await SecondPriceAuction.new(
			multiCertifierInstance.address,
			erc20Instance.address,
			tokenVestingInstance.address,
			TREASURY,
			ADMIN,
			BEGIN_TIME,
			AUCTION_CAP);
	});

  it('Ensure not started', async () => {
    await auctionInstance.currentPrice().catch(function(err){
      assert.include(err.message,'VM Exception');
    });

    await auctionInstance.tokensAvailable().catch(function(err){
      assert.include(err.message,'VM Exception');
    });

    await auctionInstance.maxPurchase().catch(function(err){
      assert.include(err.message,'VM Exception');
    });

    await auctionInstance.bonus(1000000000).catch(function(err){
      assert.include(err.message,'VM Exception');
    });

    await auctionInstance.theDeal(1000000000).catch(function(err){
      assert.include(err.message,'VM Exception');
    });
  });

  it('End time', async () => {
    let endTime = await auctionInstance.endTime();
    //console.log(endTime);
  });

  it('Current price', async () => {

		increaseTime(1000);


		increaseTime(HOUR_EPOCH);

		let fValue1 = await auctionInstance.currentPrice();
		let finaliseValue1 = fValue1.toNumber();

		increaseTime(HOUR_EPOCH*240);

		let fValue = await auctionInstance.currentPrice();
		let finaliseValue = fValue.toNumber();


	});

});
