const MultiCertifier = artifacts.require('./MultiCertifier.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');
const constants = require('../global.js');

contract('MultiCertifier.sol', function(accounts) {
  let multiCertifierInstance;

	it('Deply MultiCertifier', async () => {
		multiCertifierInstance = await MultiCertifier.new();
	});


  it('Add Delegate', async () => {
    /* ---- only_owner; ---- */
   let only_owner = multiCertifierInstance.addDelegate(constants.ADMIN, {from:constants.PARTICIPANT_ONE});
   AssertRevert.assertRevert(only_owner);

    await multiCertifierInstance.addDelegate(constants.ADMIN);
    assert.equal(await multiCertifierInstance.delegates(constants.ADMIN), true, 'Delegate added');
    assert.equal(await multiCertifierInstance.delegates(constants.PARTICIPANT_ONE), false, 'Delegate false');
    });

  it('Remove delegate', async () => {
    let only_owner = multiCertifierInstance.removeDelegate(constants.ADMIN, {from:constants.PARTICIPANT_ONE});
    AssertRevert.assertRevert(only_owner);

    await multiCertifierInstance.removeDelegate(constants.ADMIN);
    assert.equal(await multiCertifierInstance.delegates(constants.ADMIN), false, 'Delegate removed');
    await multiCertifierInstance.addDelegate(constants.ADMIN);
  });

  it('certify', async () => {
    /* ---- only_delegate; not delgate/owner ---- */
    let only_delegate_neither = multiCertifierInstance.certify(constants.PARTICIPANT_TWO, {from:constants.PARTICIPANT_ONE});
    AssertRevert.assertRevert(only_delegate_neither);

    /* ---- from owner ---- */
    await multiCertifierInstance.certify(constants.PARTICIPANT_TWO);
    let certs = await multiCertifierInstance.certs(constants.PARTICIPANT_TWO);
    assert.equal(certs[1], true, 'PARTICIPANT2 added');
    assert.equal(certs[0], constants.OWNER, 'PARTICIPANT2 added');

    let certified = await multiCertifierInstance.certified(constants.PARTICIPANT_TWO);
    assert.equal(certified, true, 'certified getter true');

    let certifier = await multiCertifierInstance.getCertifier(constants.PARTICIPANT_TWO);
    assert.equal(certifier, constants.OWNER, 'certifier getter equal to owner');

    /* ---- only_uncertified ---- */
    let only_uncertified = multiCertifierInstance.certify(constants.PARTICIPANT_TWO);
    AssertRevert.assertRevert(only_uncertified);
  });

  it('revoke', async () => {
    /* ---- only_certifier_of; not certifier ---- */
    let only_certifier_of = multiCertifierInstance.revoke(constants.PARTICIPANT_TWO, {from:constants.PARTICIPANT_ONE});
    AssertRevert.assertRevert(only_certifier_of);

    /* ---- only_certified ---- */
    let only_certifier = multiCertifierInstance.revoke(constants.PARTICIPANT_ONE);
    AssertRevert.assertRevert(only_certifier);

    await multiCertifierInstance.revoke(constants.PARTICIPANT_TWO);
    let certs = await multiCertifierInstance.certs(constants.PARTICIPANT_TWO);
    assert.equal(certs[1], false, 'PARTICIPANT2 added');
    assert.equal(certs[0], constants.OWNER, 'PARTICIPANT2 added');
  });

  it('Unused interface functions', async () => {
    await multiCertifierInstance.get(constants.PARTICIPANT_ONE, 'test');
    await multiCertifierInstance.getAddress(constants.PARTICIPANT_ONE, 'test');
    await multiCertifierInstance.getUint(constants.PARTICIPANT_ONE, 'test');
  });
});
