const MultiCertifier = artifacts.require('./MultiCertifier.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');
const constants = require('../../helpers/global.js');

contract('Certifier - MultiCertifier.sol', function(accounts) {
  it('Grab needed deployed contracts', async () => {
    this.multiCertifierInstance = await MultiCertifier.deployed();
  });

  describe('function - addDelegate()', () => {
    it('catch onlyOwner modifier', async () => {
      let onlyOwner = this.multiCertifierInstance.addDelegate(constants.ADMIN, {from:constants.PARTICIPANT_ONE});
      AssertRevert.assertRevert(onlyOwner);
    });

    it('set delegate to be ADMIN', async () => {
      await this.multiCertifierInstance.addDelegate(constants.ADMIN);
      assert.equal(await this.multiCertifierInstance.delegates(constants.ADMIN), true, 'Delegate added');
      assert.equal(await this.multiCertifierInstance.delegates(constants.PARTICIPANT_ONE), false, 'Delegate false');
    });
  });

  describe('function - removeDelegate()', () => {
    it('catch onlyOwner modifier', async () => {
      let onlyOwner = this.multiCertifierInstance.removeDelegate(constants.ADMIN, {from:constants.PARTICIPANT_ONE});
      AssertRevert.assertRevert(onlyOwner);
    });

    it('remove delegate ADMIN', async () => {
      await this.multiCertifierInstance.removeDelegate(constants.ADMIN);
      assert.equal(await this.multiCertifierInstance.delegates(constants.ADMIN), false, 'Delegate removed');
    });

    it('re-set delegate to ADMIN', async () => {
      await this.multiCertifierInstance.addDelegate(constants.ADMIN);
      assert.equal(await this.multiCertifierInstance.delegates(constants.ADMIN), true, 'Delegate re-added');
    });
  });

  describe('function - certify()', () => {
    it('catch only_delegate modifier', async () => {
      let only_delegate_neither = this.multiCertifierInstance.certify(constants.PARTICIPANT_TWO, {from:constants.PARTICIPANT_ONE});
      AssertRevert.assertRevert(only_delegate_neither);
    });

    it('set certified PARTICIPANT_TWO to TRUE', async () => {
      await this.multiCertifierInstance.certify(constants.PARTICIPANT_TWO);
      let certs = await this.multiCertifierInstance.certs(constants.PARTICIPANT_TWO);
      assert.equal(certs[1], true, 'PARTICIPANT2 added');
      assert.equal(certs[0], constants.OWNER, 'PARTICIPANT2 added');
    });

    it('get certified() PARTICIPANT_TWO', async () => {
      let certified = await this.multiCertifierInstance.certified(constants.PARTICIPANT_TWO);
      assert.equal(certified, true, 'certified getter true');
    });

    it('get getCertifier() PARTICIPANT_TWO', async () => {
      let certifier = await this.multiCertifierInstance.getCertifier(constants.PARTICIPANT_TWO);
      assert.equal(certifier, constants.OWNER, 'certifier getter equal to owner');
    });

    it('catch only_uncertified modifier', async () => {
      let only_uncertified = this.multiCertifierInstance.certify(constants.PARTICIPANT_TWO);
      AssertRevert.assertRevert(only_uncertified);
    });
  });

  describe('function - revoke()', () => {
    it('catch only_certifier_of modifier', async () => {
      let only_certifier_of = this.multiCertifierInstance.revoke(constants.PARTICIPANT_TWO, {from:constants.PARTICIPANT_ONE});
      AssertRevert.assertRevert(only_certifier_of);
    });

    it('catch only_certified modifier', async () => {
      let only_certifier = this.multiCertifierInstance.revoke(constants.PARTICIPANT_ONE);
      AssertRevert.assertRevert(only_certifier);
    });

    it('revoke PARTICIPANT_TWO from OWNER', async () => {
      await this.multiCertifierInstance.revoke(constants.PARTICIPANT_TWO);
      let certs = await this.multiCertifierInstance.certs(constants.PARTICIPANT_TWO);
      assert.equal(certs[1], false, 'PARTICIPANT2 added');
      assert.equal(certs[0], constants.OWNER, 'PARTICIPANT2 added');
    });
  });
});
