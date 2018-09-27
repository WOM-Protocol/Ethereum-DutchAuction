const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('testPricing.js', function(accounts) {
  const OWNER = accounts[0];
	const ADMIN = accounts[1];
  const TREASURY = accounts[2];
  const PARTICIPANT= accounts[5];

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

	const USDWEI = 4650000000000000;


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

  it('Start', async () => {
    increaseTime(1000);
    console.log('Start Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 1 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 2 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 3 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 4 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 5 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 6 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 7 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 8 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 9 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 10 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 11 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 12 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 13 Price : ', Number(await auctionInstance.currentPrice()));
    increaseTime(DAY_EPOCH);
    console.log('Day 14 Price : ', Number(await auctionInstance.currentPrice()));
    //increaseTime(DAY_EPOCH-5);
    //console.log('Day 15 Price : ', Number(await auctionInstance.currentPrice()));

    console.log(Number(await auctionInstance.currentTime()));
    console.log(Number(await auctionInstance.endTime()));
  });

});
