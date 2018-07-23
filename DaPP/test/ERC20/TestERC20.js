const AssertRevert = require('../../helpers/AssertRevert.js');
const AssertJump = require('../../helpers/AssertJump.js');

const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const ERC20Interface = artifacts.require('./ERC20Interface.sol');

contract('ERC20BurnableAndMintable.sol - TestERC20', async (accounts) => {
  const erc20Creator = web3.eth.accounts[0];
  const userAccount = web3.eth.accounts[1];
  const userAccount2 = web3.eth.accounts[2];
  const emptyAddress = '0x0000000000000000000000000000000000000000';


  let erc20Instance;
  let erc20InterfaceInstance;

  const initialAmount = 1000;
  const tokenName = 'WOMToken';
  const decimalUnits = 18;
  const tokenSymbol = 'WOM';

  it('Deploy ERC20BurnableAndMintable', async () => {
     erc20Instance = await ERC20BurnableAndMintable.new(
       initialAmount,
       tokenName,
       decimalUnits,
       tokenSymbol,
       {from: erc20Creator});

     assert.equal(await erc20Instance.balanceOf(erc20Creator), initialAmount, 'Initial amount assigned to creator');
     assert.equal(await erc20Instance.totalSupply(), initialAmount, 'Initial amount assigned to supply');
     assert.equal(await erc20Instance.name(), tokenName, 'Token name assigned');
     assert.equal(await erc20Instance.decimals(), decimalUnits, 'Decimal units assigned');
     assert.equal(await erc20Instance.symbol(), tokenSymbol, 'Token symbol assigned');
     assert.equal(await erc20Instance.owner(), erc20Creator, 'Token owner assigned');
   });

   it('Transfer Tokens', async () => {
     let transferAmount = 100;

     /* ---- require(_to != address(0)); ---- */
    let require1 = erc20Instance.transfer(emptyAddress, transferAmount, {from:erc20Creator});
    AssertRevert.assertRevert(require1);

     /* ---- require(_to != address(this)); ---- */
     let require2 = erc20Instance.transfer(erc20Instance.address, transferAmount, {from:erc20Creator});
     AssertRevert.assertRevert(require2);

     /* ---- require(_to != address(0)); ---- */
    let require3 = erc20Instance.transfer(userAccount, 0, {from:erc20Creator});
    AssertRevert.assertRevert(require3);


     await erc20Instance.transfer(userAccount, transferAmount, {from:erc20Creator});
     assert.equal(parseInt(await erc20Instance.balanceOf(erc20Creator)), initialAmount - transferAmount, 'Balance of creator reduced by 100');
     assert.equal(parseInt(await erc20Instance.balanceOf(userAccount)), transferAmount, 'Balance of user account increased by 100');
    });

  it('Approval', async () => {
    let approveAmount = 50;

    /* ---- require(_amount > 0); ---- */
    let require1 = erc20Instance.approve(userAccount, 0, {from:erc20Creator});
    AssertRevert.assertRevert(require1);

    await erc20Instance.approve(userAccount, approveAmount, {from:erc20Creator});

    assert.equal(parseInt(await erc20Instance.allowance(erc20Creator, userAccount)), approveAmount, 'Allowance userAccount 50');
   });

  it('Transfer From', async () => {
    let approveAmount = 50;

    /* ---- require(_to != address(0));; ---- */
    let require1 = erc20Instance.transferFrom(erc20Creator, emptyAddress, approveAmount, {from:userAccount});
    AssertRevert.assertRevert(require1);

    /* ---- require(_to != address(this)); ---- */
    let require2 = erc20Instance.transferFrom(erc20Creator, erc20Instance.address, approveAmount, {from:userAccount});
    AssertRevert.assertRevert(require2);

    /* ---- require(_amount > 0); ---- */
    let require3 = erc20Instance.transferFrom(erc20Creator, userAccount2, 0, {from:userAccount});
    AssertRevert.assertRevert(require3);


    await erc20Instance.transferFrom(erc20Creator, userAccount2, approveAmount, {from:userAccount});
    assert.equal(parseInt(await erc20Instance.allowance(erc20Creator, userAccount2)), 0, 'Allowance userAccount reduced to 0');
    assert.equal(parseInt(await erc20Instance.balanceOf(erc20Creator)), initialAmount - (approveAmount+100), 'Balance of creator reduced by 50');
    assert.equal(parseInt(await erc20Instance.balanceOf(userAccount2)), approveAmount, 'Balance of userAccount2 increased by 150');
  });

  it('Burn', async () => {
    let burnAmount = 50;

    /* ---- require(_amount > 0); ---- */
    let require1 = erc20Instance.burn(0, {from:userAccount2});
    AssertRevert.assertRevert(require1);

    await erc20Instance.burn(50, {from:userAccount2});
    assert.equal(parseInt(await erc20Instance.balanceOf(userAccount2)), 0, 'Balance of userAccount2 reduced to 0');
    assert.equal(parseInt(await erc20Instance.totalSupply())  , initialAmount - burnAmount, 'Supply reduced by 50');
  });

  it('Approval and burn from', async () => {
    let approveAmount = 50;

    // ----- Approve ----- ///
    await erc20Instance.approve(userAccount, approveAmount, {from:erc20Creator});
    assert.equal(parseInt(await erc20Instance.allowance(erc20Creator, userAccount)), approveAmount, 'Allowance userAccount 50');

    /* ----- require(_amount > 0); ---- */
    let require1 = erc20Instance.burnFrom(erc20Creator, 0,{from:userAccount});
    AssertRevert.assertRevert(require1);

    // ----- BurnFrom ----- ///
    await erc20Instance.burnFrom(erc20Creator, approveAmount,{from:userAccount});
    assert.equal(parseInt(await erc20Instance.allowance(erc20Creator, userAccount)), 0, 'Allowance userAccount 0');
    assert.equal(parseInt(await erc20Instance.totalSupply()), 900, 'Total supply updated 900');
    assert.equal(parseInt(await erc20Instance.balanceOf(erc20Creator)), initialAmount - 200, 'Balance of creator reduced by 50');
  });

  it('Mint', async () => {
     let mintAmount = 100;

     /* ----- require(_amount > 0); ---- */
     let require1 = erc20Instance.mint(erc20Creator, 0, {from:erc20Creator});
     AssertRevert.assertRevert(require1);

     /* ----- require(msg.sender == owner); ---- */
     let require2 = erc20Instance.mint(erc20Creator, mintAmount, {from:userAccount});
     AssertRevert.assertRevert(require2);


    await erc20Instance.mint(erc20Creator, mintAmount, {from:erc20Creator});
    assert.equal(parseInt(await erc20Instance.totalSupply()), initialAmount, 'Total supply updated 1000');
    assert.equal(parseInt(await erc20Instance.balanceOf(erc20Creator)), initialAmount - 100, 'Balance of creator updated');
  });

  it('Ensure revert fallback', async () => {
  ///  await erc20Instance.sendTransaction({from:web3.eth.coinbase, to:erc20Instance.address, value:web3.toWei(0.05, 'ether')});
    //  let revert1 = erc20Instance.sendTransaction({from:web3.eth.coinbase, to:erc20Instance.address, value:web3.toWei(0.05, 'ether')});
    //  AssertRevert.assertRevert(revert1);
  });

});
