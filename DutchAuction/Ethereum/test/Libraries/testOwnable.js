const Ownable = artifacts.require('./Ownable.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');

contract('Ownable.sol - testOwnable', async (accounts) => {
  const FIRST_OWNER = accounts[0];
  const SECOND_OWNER = accounts[1];
  const NOT_OWNER = accounts[6];

  const emptyAddress = '0x0000000000000000000000000000000000000000';

  let ownableInstance;
  it('Deploy Ownable.sol', async () => {
    ownableInstance = await Ownable.new({from:FIRST_OWNER});

    assert.equal(await ownableInstance.owner(), FIRST_OWNER, 'Owner is correctly set');
  });


  it('transferOwnership', async () => {
    /* --- only_owner ---- */
   let only_owner = ownableInstance.transferOwnership(SECOND_OWNER, {from:NOT_OWNER});
   AssertRevert.assertRevert(only_owner);

     /* --- require(_newOwner != address(0)); ---- */
    let require_not_empty = ownableInstance.transferOwnership(emptyAddress, {from:FIRST_OWNER});
    AssertRevert.assertRevert(require_not_empty);

    await ownableInstance.transferOwnership(SECOND_OWNER, {from:FIRST_OWNER});
    assert.equal(await ownableInstance.owner(), SECOND_OWNER, 'Owner is correctly set');
  });

  it('renounceOwnership', async () => {
    /* --- only_owner ---- */
   let only_owner = ownableInstance.renounceOwnership({from:NOT_OWNER});
   AssertRevert.assertRevert(only_owner);
   await ownableInstance.renounceOwnership({from:SECOND_OWNER});
   assert.equal(await ownableInstance.owner(), emptyAddress, 'Empty owner address');
  });
});
