const ContractManager = artifacts.require('./ContractManager.sol');
const Database = artifacts.require('./Database.sol');
const InitializeVariables = artifacts.require('./InitializeVariables.sol');
const HashFunctions = artifacts.require('./HashFunctions.sol');

contract('Database.sol - TestDatabase', async (accounts) => {
  const ownerAddr1 = web3.eth.accounts[0];
  const ownerAddr2 = web3.eth.accounts[1];
  const ownerAddr3 = web3.eth.accounts[2];

  const mimicContract = web3.eth.accounts[3];
  const randomAddress = web3.eth.accounts[4];
  const valueCreationFundAddress = web3.eth.accounts[8];
  const emptyAddress = '0x0000000000000000000000000000000000000000';

  const userName = 'ConnorBlockchain';

  let contractManagerInstance;
  let dbInstance;
  let initialVariableInstance;
  let hfInstance;


  it("Deploy all contracts", async () => {
     dbInstance = await Database.new(ownerAddr1, ownerAddr2, ownerAddr3);
     hfInstance = await HashFunctions.new();
     assert.equal(await dbInstance.boolStorage(await hfInstance.stringAddress('owner', ownerAddr1)), true, 'Owner address 1 set in database');
     assert.equal(await dbInstance.boolStorage(await hfInstance.stringAddress('owner', ownerAddr2)), true, 'Owner address 2 set in database');
     assert.equal(await dbInstance.boolStorage(await hfInstance.stringAddress('owner', ownerAddr2)), true, 'Owner address 3 set in database');

    /* ------------ Contract Manager ------------ */
     contractManagerInstance = await ContractManager.new(dbInstance.address);
     await dbInstance.setContractManager(contractManagerInstance.address);


     /* ------------ InitializeVariables ------------ */
     initialVariableInstance = await InitializeVariables.new(dbInstance.address);
     await contractManagerInstance.addContract('InitialVariables', initialVariableInstance.address, ownerAddr2);

     /* ------------ MimicContract ------------ */
     await contractManagerInstance.addContract('MimicContract', mimicContract, ownerAddr2);
     await initialVariableInstance.startDapp(valueCreationFundAddress);
     /* ------------ FinalizeDeployment ------------ */
     await contractManagerInstance.setDeployFinished();
   });

/*  it('Set address', async () => {
      await dbInstance.setAddress(await hfInstance.stringHash('address'), randomContract, {from:mimicContract});
      assert.equal(await dbInstance.addressStorage(await hfInstance.stringHash('address'), randomContract), 'address set');
  });

  it('Delete address', async () => {
      await dbInstance.deleteAddress(await hfInstance.stringHash('address'),{from:mimicContract});
      console.log(await dbInstance.addressStorage(await hfInstance.stringHash('address')));

      //assert.equal(await dbInstance.addressStorage(await hfInstance.stringHash('address'), randomContract), 'address set');
  });*/

 });
