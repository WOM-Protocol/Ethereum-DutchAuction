const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');
const constants = require('../global.js');

contract('test - CertifierHandler', function(accounts) {
	let certifierHandlerInstance;
	let multiCertifierInstance;

	it('Deploy MultiCertifier', async () => {
		multiCertifierInstance = await MultiCertifier.new();
	});

	it('Deploy CertifierHandler', async () => {
		certifierHandlerInstance = await CertifierHandler.new(multiCertifierInstance.address, constants.TREASURY);
	});

  it('Set Fee', async () => {
    let only_owner = certifierHandlerInstance.setFee(1,{from:constants.NOT_OWNER});
    AssertRevert.assertRevert(only_owner);
    assert.equal(await certifierHandlerInstance.fee(), 0);

    await certifierHandlerInstance.setFee(1);
    assert.equal(await certifierHandlerInstance.fee(), 1);
	});

  it('Set Treasury', async () => {
    let only_owner = certifierHandlerInstance.setTreasury(constants.ADMIN,{from:constants.NOT_OWNER});
    AssertRevert.assertRevert(only_owner);
    assert.equal(await certifierHandlerInstance.treasury(), constants.TREASURY);

    await certifierHandlerInstance.setTreasury(constants.ADMIN);
    assert.equal(await certifierHandlerInstance.treasury(), constants.ADMIN);

    await certifierHandlerInstance.setTreasury(constants.TREASURY);
    assert.equal(await certifierHandlerInstance.treasury(), constants.TREASURY);
  });

  it('Set Locked', async () => {
    let only_owner = certifierHandlerInstance.setLocked(constants.LOCKED_ACCOUNT,{from:constants.NOT_OWNER});
    AssertRevert.assertRevert(only_owner);
    assert.equal(await certifierHandlerInstance.locked(constants.LOCKED_ACCOUNT), false);

    await certifierHandlerInstance.setLocked(constants.LOCKED_ACCOUNT);
    assert.equal(await certifierHandlerInstance.locked(constants.LOCKED_ACCOUNT), true);
	});


});
