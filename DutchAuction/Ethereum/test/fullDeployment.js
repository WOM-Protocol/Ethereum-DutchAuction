const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');


contract('Full Deployment Test', function(accounts) {
	const TREASURY = accounts[0];
	const ADMIN = accounts[1];
	const OWNER = accounts[2];
	const PARTICIPANT = accounts[5];

	const TOKEN_SUPPLY = 1000000000000000000000000000;
	const AUCTION_CAP = 350000000000000000000000000;
	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';
	const DECIMAL_UNITS = 18;

	const DAY_EPOCH = 86400;
	const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp;

	let multiCertifierInstance;
	let auctionInstance;
	let erc20Instance;
  let tokenVestingInstance;
	let certifierHandlerInstance;

	it('Deploy Token', async () => {
		erc20Instance = await ERC20BurnableAndMintable.new(
			TOKEN_SUPPLY, TOKEN_NAME, 18, TOKEN_SYMBOL);
			assert.equal(await erc20Instance.balanceOf(TREASURY), TOKEN_SUPPLY, 'Initial amount assigned to creator');
			assert.equal(await erc20Instance.totalSupply(), TOKEN_SUPPLY, 'Initial amount assigned to supply');
			assert.equal(await erc20Instance.name(), TOKEN_NAME, 'Token name assigned');
			assert.equal(await erc20Instance.decimals(), DECIMAL_UNITS, 'Decimal units assigned');
			assert.equal(await erc20Instance.symbol(), TOKEN_SYMBOL, 'Token symbol assigned');
			assert.equal(await erc20Instance.owner(), TREASURY, 'Token owner assigned');
	});

	it('Deploy MultiCertifier', async () => {
		multiCertifierInstance = await MultiCertifier.new();
	});

	it('Deploy CertifierHandler', async () => {
		certifierHandlerInstance = await CertifierHandler.new(multiCertifierInstance.address, TREASURY);
		assert.equal(await certifierHandlerInstance.treasury(), TREASURY, 'TREASURY address assigned');
	});

  it('Deploy Token Vesting', async () => {
		tokenVestingInstance = await TokenVesting.new(erc20Instance.address);
		assert.equal(await tokenVestingInstance.tokenAddress(), erc20Instance.address, 'ERC20 token address assigned');
		assert.equal(await tokenVestingInstance.tokenInstance(), erc20Instance.address, 'Token instance assigned');
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

		let endTime = BEGIN_TIME + (15 * DAY_EPOCH);
		assert.equal(await auctionInstance.certifier(), multiCertifierInstance.address, 'MultiCertifier address set');
		assert.equal(await auctionInstance.tokenContract(), erc20Instance.address, 'Token address set');
		assert.equal(await auctionInstance.tokenVesting(), tokenVestingInstance.address, 'Token vesting address set');
		assert.equal(await auctionInstance.treasury(), TREASURY, 'Treasury address set');

		assert.equal(await auctionInstance.admin(), ADMIN, 'Admin address set');
		assert.equal(await auctionInstance.beginTime(), BEGIN_TIME, 'Begin time set');
		assert.equal(await auctionInstance.tokenCap(), AUCTION_CAP, 'Auction cap set');
		assert.equal(await auctionInstance.endTime(), endTime, 'End time set');
	});
});
