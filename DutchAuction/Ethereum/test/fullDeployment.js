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

	let certifierHandlerInstance;
	let multiCertifierInstance;
	let auctionInstance;
	let erc20Instance;

	it('Deploy Token', async () => {
		erc20Instance = await ERC20BurnableAndMintable.new(
			TOKEN_SUPPLY, 'WOMToken', 18, 'WOM');

		

	});
});
