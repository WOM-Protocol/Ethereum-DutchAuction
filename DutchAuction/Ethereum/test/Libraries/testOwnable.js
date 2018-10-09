const Ownable = artifacts.require('./Ownable.sol');
const AssertRevert = require('../../helpers/AssertRevert.js');

const constants = require('../global.js');

contract('Ownable.sol - testOwnable', async (accounts) => {

  let ownableInstance;
  it('Deploy Ownable.sol', async () => {
    ownableInstance = await Ownable.new({from:constants.OWNER});

    assert.equal(await ownableInstance.owner(), constants.OWNER, 'Owner is correctly set');
  });


  it('transferOwnership', async () => {
    /* --- only_owner ---- */
   let only_owner = ownableInstance.transferOwnership(constants.ADMIN, {from:constants.NOT_OWNER});
   AssertRevert.assertRevert(only_owner);

     /* --- require(_newOwner != address(0)); ---- */
    let require_not_empty = ownableInstance.transferOwnership(constants.EMPTY_ADDRESS, {from:constants.OWNER});
    AssertRevert.assertRevert(require_not_empty);

    await ownableInstance.transferOwnership(constants.ADMIN, {from:constants.OWNER});
    assert.equal(await ownableInstance.owner(), constants.ADMIN, 'Owner is correctly set');
  });

  it('renounceOwnership', async () => {
    /* --- only_owner ---- */
   let only_owner = ownableInstance.renounceOwnership({from:constants.NOT_OWNER});
   AssertRevert.assertRevert(only_owner);
   await ownableInstance.renounceOwnership({from:constants.ADMIN});
   assert.equal(await ownableInstance.owner(), constants.EMPTY_ADDRESS, 'Empty owner address');
  });
});
