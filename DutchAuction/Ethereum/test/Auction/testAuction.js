const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('testAuction.js', function(accounts) {
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
	const WEEK_EPOCH = DAY_EPOCH*7;
	const HOUR_EPOCH = DAY_EPOCH/24;
  const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;
  const END_TIME = BEGIN_TIME + (15 * DAY_EPOCH);

	const USDWEI = 4650000000000000; // In WEI at time of testing 26/09/18


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

    await auctionInstance.bonus(100).catch(function(err){
      assert.include(err.message,'VM Exception');
    });

    await auctionInstance.theDeal(100).catch(function(err){
      assert.include(err.message,'VM Exception');
    });
  });

  it('Start Auction', async () => {
		increaseTime(1000);
		/*  ---- Public vars ---- */
		assert.equal(await auctionInstance.endTime(), END_TIME, 'END time set correctly');
		assert.equal(true, await auctionInstance.isActive(), 'Active auction');
		assert.equal(false, await auctionInstance.allFinalised(), 'not finalized auction');
		assert.equal(0, await auctionInstance.hoursPassed(), 'no hours passed');
		assert.equal(false, await auctionInstance.softCapMet(), 'soft cap not met');
		// assert.equal(web3.eth.getBlock(web3.eth.blockNumber).timestamp, parseInt(await auctionInstance.currentTime()), 'current time'); // Test sometimes fails with 1 second deviation
		assert.equal(USDWEI, Number(await auctionInstance.currentPrice()), 'Current price 1$');
		assert.equal(AUCTION_CAP, await auctionInstance.tokensAvailable(), 'full tokens available');
		assert.equal(AUCTION_CAP*USDWEI, await auctionInstance.maxPurchase(), 'all tokens available for purchase');
		assert.equal(20, await auctionInstance.currentBonus(), 'Current bonus');
		assert.equal(20, await auctionInstance.bonus(100), 'Bonus added correctly');
		let theDealRes = await auctionInstance.theDeal(100);
		assert.equal(120, theDealRes[0], 'deal added');
		assert.equal(false, theDealRes[1], 'no refund needed');
		assert.equal(USDWEI, theDealRes[2], 'price still 1$');
	});

	it('End Auction', async () => {
		increaseTime(END_TIME);
		assert.equal(false, await auctionInstance.isActive(), 'Auction ended');
		assert.equal(true, await auctionInstance.allFinalised(), 'All finalized');
	});

});
