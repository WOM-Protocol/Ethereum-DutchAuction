const Ownable = artifacts.require('./Ownable.sol');
const AssertRevert = require('../../helpers/AssertRevert.js');

const constants = require('../global.js');

contract('Libraries - testOwnable.js', async (accounts) => {

  describe('Deployment Ownable.sol', () => {
    it('deploys', async () => {
      this.ownableInstance = await Ownable.new({from:constants.OWNER});
    });

    it('initial assignment correct', async () => {
      assert.equal(await this.ownableInstance.owner(), constants.OWNER, 'Owner is correctly set');
    });
  });

  describe('function - transferOwnership()', () => {
    it('catch only_owner modifier', async () => {
      let only_owner = this.ownableInstance.transferOwnership(constants.ADMIN, {from:constants.NOT_OWNER});
      AssertRevert.assertRevert(only_owner);
    });

    it('catch require not empty address', async () => {
      let require_not_empty = this.ownableInstance.transferOwnership(constants.EMPTY_ADDRESS, {from:constants.OWNER});
      AssertRevert.assertRevert(require_not_empty);
    });

    it('transfer ownership from OWNER to ADMIN', async () => {
      await this.ownableInstance.transferOwnership(constants.ADMIN, {from:constants.OWNER});
      assert.equal(await this.ownableInstance.owner(), constants.ADMIN, 'Owner is correctly set');
    });
  });

  describe('function - renounceOwnership()', () => {
    it('catch only_owner modifier', async () => {
      let only_owner = this.ownableInstance.renounceOwnership({from:constants.NOT_OWNER});
      AssertRevert.assertRevert(only_owner);
    });

    it('renounce ownership from ADMIN', async () => {
      await this.ownableInstance.renounceOwnership({from:constants.ADMIN});
      assert.equal(await this.ownableInstance.owner(), constants.EMPTY_ADDRESS, 'Empty owner address');
     });
  });
});
