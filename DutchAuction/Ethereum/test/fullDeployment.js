const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');

contract('fullDeployment', function(accounts) {
	const TREASURY = accounts[0];
	const ADMIN = accounts[1];
	const OWNER = accounts[2];
	const PARTICIPANT = accounts[5];

	const TOKEN_SUPPLY = 1000000000;
	const AUCTION_CAP = 350000000;
	const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp;

	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';

	const DECIMAL_UNITS = 18;
	let certifierHandlerInstance;
	let multiCertifierInstance;
	let auctionInstance;
	let erc20Instance;

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

	it('Deply MultiCertifier', async () => {
		multiCertifierInstance = await MultiCertifier.new();
	});

	it('Deply SecondPriceAuction', async () => {
		auctionInstance = await SecondPriceAuction.new(
			multiCertifierInstance.address,
			erc20Instance.address,
			TREASURY,
			ADMIN,
			BEGIN_TIME,
			AUCTION_CAP);
	});

});
