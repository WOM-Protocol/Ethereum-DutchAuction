const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('testAdmin.js', function(accounts) {
  const OWNER = accounts[0];
	const ADMIN = accounts[1];
  const TREASURY = accounts[2];
  const PARTICIPANT= accounts[5];
  const PRESALE_PARTICIPANT= accounts[6];


  const TRAILING_DECIMALS = 000000000000000000;
	const TOKEN_SUPPLY = 1000000000000000000000000000;
	const AUCTION_CAP = 350000000000000000000000000;
	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';
	const DECIMAL_UNITS = 18;

	const DAY_EPOCH = 86400;
  const BEGIN_TIME = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1000;
  const END_TIME = BEGIN_TIME + (15 * DAY_EPOCH);
  const YEAR_EPOCH = DAY_EPOCH*365;

  const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

  let hashedMessage;
  let r;
  let s;
  let v;

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

  it('Admin register presalevest', async () => {
    /* ---- notEmptyUint ---- */
    let notEmptyUint = tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, 0, YEAR_EPOCH+END_TIME, 2*YEAR_EPOCH);
    AssertRevert.assertRevert(notEmptyUint);

    /* ---- notEmptyAddress ---- */
    let notEmptyAddress = tokenVestingInstance.registerPresaleVest(EMPTY_ADDRESS, YEAR_EPOCH, YEAR_EPOCH+END_TIME, 2*YEAR_EPOCH);
    AssertRevert.assertRevert(notEmptyAddress);

    /* ---- require(_cliff <= _duration); ---- */
    let require_cliff = tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, 2*YEAR_EPOCH, YEAR_EPOCH+END_TIME, YEAR_EPOCH);
    AssertRevert.assertRevert(require_cliff);

    await tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, YEAR_EPOCH, YEAR_EPOCH+END_TIME, 2*YEAR_EPOCH);
    let users = await tokenVestingInstance.users(PRESALE_PARTICIPANT);
    assert.equal(users[0], YEAR_EPOCH+END_TIME);
    assert.equal(users[1], YEAR_EPOCH);
    assert.equal(users[2], 2*YEAR_EPOCH);

    /* ---- notRegistered ---- */
    let notRegistered = tokenVestingInstance.registerPresaleVest(PRESALE_PARTICIPANT, YEAR_EPOCH, YEAR_EPOCH+END_TIME, 2*YEAR_EPOCH);
    AssertRevert.assertRevert(notRegistered);
    await auctionInstance.inject(PRESALE_PARTICIPANT, web3.toWei(35971,'ether'), 15, {from:ADMIN});
  });

  it('Buyin & set time ended', async () => {
    /*const message = 'TLCS.'
    hashedMessage = web3.sha3(message)
    var sig = await web3.eth.sign(PARTICIPANT, hashedMessage).slice(2)
    r = '0x' + sig.slice(0, 64)
    s = '0x' + sig.slice(64, 128)
    v = web3.toDecimal(sig.slice(128, 130)) + 27
    assert.equal(await auctionInstance.isSigned(PARTICIPANT, hashedMessage, v, r, s), true);
    assert.equal(await auctionInstance.recoverAddr(hashedMessage, v, r, s), PARTICIPANT);

      // certify //
    await multiCertifierInstance.certify(PARTICIPANT);

      // -- Buyin -- //
    await auctionInstance.buyin(v, r, s, {from:PARTICIPANT, value: web3.toWei(1,'ether')});
    increaseTime(END_TIME);*/
  });

	it('Pre-sale finalise', async () => {
	  //increaseTime(END_TIME);

	});
});
