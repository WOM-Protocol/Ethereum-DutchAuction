const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');

contract('test - CertifierHandler', function(accounts) {
  const OWNER = accounts[0];
	const ADMIN = accounts[1];
  const TREASURY = accounts[2];
  const PARTICIPANT1 = accounts[3];
	const PARTICIPANT2 = accounts[4];
  const LOCKED_ACCOUNT = accounts[5];
  const NOT_OWNER = accounts[6];

	const TOKEN_SUPPLY = 1000000000;
	const AUCTION_CAP = 350000000;
	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';
	const DECIMAL_UNITS = 18;

	let certifierHandlerInstance;
	let multiCertifierInstance;

	it('Deploy MultiCertifier', async () => {
		multiCertifierInstance = await MultiCertifier.new();
	});

	it('Deploy CertifierHandler', async () => {
		certifierHandlerInstance = await CertifierHandler.new(multiCertifierInstance.address, TREASURY);
	});

  it('Set Fee', async () => {
    let only_owner = certifierHandlerInstance.setFee(1,{from:NOT_OWNER});
    AssertRevert.assertRevert(only_owner);
    assert.equal(await certifierHandlerInstance.fee(), 0);

    await certifierHandlerInstance.setFee(1);
    assert.equal(await certifierHandlerInstance.fee(), 1);
	});

  it('Set Treasury', async () => {
    let only_owner = certifierHandlerInstance.setTreasury(ADMIN,{from:NOT_OWNER});
    AssertRevert.assertRevert(only_owner);
    assert.equal(await certifierHandlerInstance.treasury(), TREASURY);

    await certifierHandlerInstance.setTreasury(ADMIN);
    assert.equal(await certifierHandlerInstance.treasury(), ADMIN);

    await certifierHandlerInstance.setTreasury(TREASURY);
    assert.equal(await certifierHandlerInstance.treasury(), TREASURY);
  });

  it('Set Locked', async () => {
    let only_owner = certifierHandlerInstance.setLocked(LOCKED_ACCOUNT,{from:NOT_OWNER});
    AssertRevert.assertRevert(only_owner);
    assert.equal(await certifierHandlerInstance.locked(LOCKED_ACCOUNT), false);

    await certifierHandlerInstance.setLocked(LOCKED_ACCOUNT);
    assert.equal(await certifierHandlerInstance.locked(LOCKED_ACCOUNT), true);
	});


});
