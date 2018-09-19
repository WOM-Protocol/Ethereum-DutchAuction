var util = require("ethereumjs-util");

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
	const TLCS = 'This is an example terms and conditions.';
	const STATEMENT_HASH = web3.sha3("\x19Ethereum Signed Message:\n32	" + web3.sha3(TLCS));

	let signature;
	let r;
	let s;
	let v;
	let vDecimal;

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

  it('Sign statement hash', async () => {
		const message = 'Message to sign here.'
    const hexMessage = '0x' + Buffer.from(message).toString('hex');
		const unlockedAccount = web3.eth.coinbase

		var h = web3.sha3('\x19Ethereum Signed Message:\n32' + message.length + web3.sha3(message))
		var sig = await web3.eth.sign(accounts[0], h).slice(2)
		var r = '0x' + sig.slice(0, 64)
		var s = '0x' + sig.slice(64, 128)
		var v = web3.toDecimal(sig.slice(128, 130)) + 27

		var result = await auctionInstance.recoverAddr(h, v, r, s)
		console.log('result: ', result)
		console.log('PARTICIPANT', accounts[0]);

  /*  var signature = await web3.eth.sign(unlockedAccount, hexMessage)
    r = signature.substr(0, 66)
    s = '0x' + signature.substr(66, 64)
    v = '0x' + signature.substr(130, 2)
		console.log('  r: ' + r);
		console.log('  s: ' + s);
		console.log('  v: ' + v);

		let recoveredAddress = await auctionInstance.recoverAddr(hashedMessage, v, r, s)
		console.log('recoveredAddress   :', recoveredAddress);









		/*signature = await web3.eth.sign(PARTICIPANT, STATEMENT_HASH, {from: PARTICIPANT});
		r = signature.substr(0, 66)
    s = '0x' + signature.substr(66, 64)
		v = '0x' + (parseInt(signature.substr(130, 2)) + 27)




		let recoveredAddress = await auctionInstance.recoverAddr(STATEMENT_HASH, v, r, s);
		console.log(recoveredAddress);









		/*var messageBuffer = new Buffer(STATEMENT_HASH, 'hex');
		signature = web3.eth.sign(PARTICIPANT, STATEMENT_HASH);

		r = new Buffer(signature.substring(0, 64), 'hex')
		s = new Buffer(signature.substring(64, 128), 'hex')
		v = new Buffer((parseInt(signature.substring(128, 130)) + 27).toString());

		console.log('r s v: ', r, s , v);
		var pub = util.ecrecover(messageBuffer, v, r, s);
		console.log('pub: ', pub);
		r = signature.slice(0, 64);
		s = '0x' + signature.slice(64, 128);
		v = '0x' + signature.slice(128, 130);
		vDecimal = web3.toDecimal(v)

		console.log(PARTICIPANT);
		console.log(signature);
		console.log('\nr ', r);
		console.log('s ', s);
		console.log('v ', v);
		console.log('vDecimal ', vDecimal);

		let addressOfSignature = await auctionInstance.recoverAddr(STATEMENT_HASH, v, r, s);
		console.log('addressOfSignature ', addressOfSignature);*/

  });

  it('Admin uninject', async () => {

  });


  it('Admin set halted', async () => {

  });
});
