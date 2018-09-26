const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('test - auction', function(accounts) {
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

	const USDWEI = 4534000000000000; // In WEI at time of testing 17/09/18


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

  it('Admin inject', async () => {
    /* --- only_admin --- */
    await auctionInstance.inject(PARTICIPANT, 100, 15, {from:PARTICIPANT}).catch(function(err){
      assert.include(err.message,'VM Exception');
    });

    await auctionInstance.inject(PARTICIPANT, 100, 15, {from:ADMIN});
    assert.equal(100, await auctionInstance.totalReceived(), 'Total recieved updated');
    assert.equal(115, await auctionInstance.totalAccounted(), 'Total accounted updated');
    let buyinsUser = await auctionInstance.buyins(PARTICIPANT);
    assert.equal(115, buyinsUser[0], 'participant accounted updated');
    assert.equal(100, buyinsUser[1], 'participant accounted updated');
    assert.equal(true, buyinsUser[2], 'participant accounted updated');
  });

  it('Admin uninject', async () => {
    /* --- only_admin --- */
    await auctionInstance.uninject(PARTICIPANT, {from:PARTICIPANT}).catch(function(err){
      assert.include(err.message,'VM Exception');
    });

    await auctionInstance.uninject(PARTICIPANT,{from:ADMIN});
    assert.equal(0, await auctionInstance.totalReceived(), 'Total recieved updated');
    assert.equal(0, await auctionInstance.totalAccounted(), 'Total accounted updated');
    let buyinsUser = await auctionInstance.buyins(PARTICIPANT);
    assert.equal(0, buyinsUser[0], 'participant account deleted');
    assert.equal(0, buyinsUser[1], 'participant account deleted');
    assert.equal(false, buyinsUser[2], 'participant account deleted');
  });


  it('Admin set halted', async () => {
    /* --- only_admin --- */
    await auctionInstance.setHalted(true, {from:PARTICIPANT}).catch(function(err){
      assert.include(err.message, 'VM Exception');
    });

    await auctionInstance.setHalted(true, {from:ADMIN});
    assert.equal(true, await auctionInstance.halted(), 'halted set');
  });
});