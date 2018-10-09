const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');
const constants = require('../global.js');

contract('test - CertifierHandler', function(accounts) {
	describe('Deployment', () => {
    it('MultiCertifier', async () => {
      this.multiCertifierInstance = await MultiCertifier.new();
    });

    it('CertifierHandler', async () => {
      this.certifierHandlerInstance = await CertifierHandler.new(this.multiCertifierInstance.address, constants.TREASURY);
    });
  });

	describe('function - setFee()', () => {
    it('catch only_owner modifier', async () => {
			let only_owner = this.certifierHandlerInstance.setFee(1,{from:constants.NOT_OWNER});
	    AssertRevert.assertRevert(only_owner);
			assert.equal(await this.certifierHandlerInstance.fee(), 0);
    });

    it('set fee to 1', async () => {
			await this.certifierHandlerInstance.setFee(1);
			assert.equal(await this.certifierHandlerInstance.fee(), 1);
		});
  });

	describe('function - setTreasury()', () => {
		it('catch only_owner modifier', async () => {
			let only_owner = this.certifierHandlerInstance.setTreasury(constants.ADMIN,{from:constants.NOT_OWNER});
	    AssertRevert.assertRevert(only_owner);
	    assert.equal(await this.certifierHandlerInstance.treasury(), constants.TREASURY);
		});

		it('set treasury from TREASURY to ADMIN', async () => {
			await this.certifierHandlerInstance.setTreasury(constants.ADMIN);
	    assert.equal(await this.certifierHandlerInstance.treasury(), constants.ADMIN);
		});

		it('set treasury from ADMIN to TREASURY', async () => {
			await this.certifierHandlerInstance.setTreasury(constants.TREASURY);
	    assert.equal(await this.certifierHandlerInstance.treasury(), constants.TREASURY);
		});
	});

	describe('function - setLocked()', () => {
		it('catch only_owner modifier', async () => {
			let only_owner = this.certifierHandlerInstance.setLocked(constants.LOCKED_ACCOUNT,{from:constants.NOT_OWNER});
	    AssertRevert.assertRevert(only_owner);
	    assert.equal(await this.certifierHandlerInstance.locked(constants.LOCKED_ACCOUNT), false);
		});

		it('set LOCKED_ACCOUNT to locked', async () => {
			await this.certifierHandlerInstance.setLocked(constants.LOCKED_ACCOUNT);
	    assert.equal(await this.certifierHandlerInstance.locked(constants.LOCKED_ACCOUNT), true);
		});
	});
});
