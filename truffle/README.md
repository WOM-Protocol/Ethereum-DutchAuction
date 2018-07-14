# Overview


# Architecture

<p align="center">
  <img src="" alt="WOM Architecture"/>
</p>


## ContractManager
ContractManager.sol is where all current contracts are registered in the WOM platform. The Database contract will not allow anybody to change the data unless the caller is registered in the ContractManager contract. To add or remove contracts from the platform a multi-sig agreement from the owners is required. As long as ContractManager is able to add new contracts, it will be upgradeable itself.

#### addContract()
Description: Adds contract address with associated contract name into the Database as a verified contract that write access to the storage values inside of Database.  
Param _name: Name of contract, e.g. InitialVariables == 'InitialVariables'  
Param _contractAddress: Address of contract, e.g. InitialVariables.address  
Param _functionSigner: One of 3 owners that was added in Database initialization  
Example: await ContractManager.addContract('InitialVariables', InitialVariables.address, ownerAddress2,{from:web3.eth.coinbase});  

#### removeContract()
Description: Removes contract by using contracts name, to not allow that contract write access to storage values inside of Database.  
Param _name: Name of contract, e.g. InitialVariables == 'InitialVariables'  
Param _functionSigner: One of 3 owners that was added in Database initialization  
Example: await ContractManager.addContract('InitialVariables', ownerAddress2,{from:web3.eth.coinbase});  

#### updateContract()
Description: Updated contract address, but using contracts name, to shift write access to the new contract address.  This is the core functionality of upgradeable smart contracts.  
Param _name: Name of contract, e.g. InitialVariables == 'InitialVariables'  
Param _newContractAddress: Address of contract, e.g. InitialVariables2.address  
Param _functionSigner: One of 3 owners that was added in Database initialization  
Example: await ContractManager.addContract('InitialVariables', InitialVariables2.address, ownerAddress2,{from:web3.eth.coinbase});  


## Database
Database.sol holds all long term data for the platform. It stores all data in mappings which can be referenced with a bytes32 key, which is produced from the sha3 hash of variable names with associated ID's and user addresses. This contract is inspired by RocketStorage's spoke and hub model, and it will be the only contract on the platform that is not upgradeable, since it holds all the data on the platform. For this reason it is written very simple and robust, only taking bytes32 keys to store values. The database contract will only accept transactions originating from one of the contracts registered in ContractManager.

#### How to retrieve any data from Database:
Let's use boolStorage for the following example, but this hashing technique is used for all the other storage variables.  For this example, we have initialized 3 owners inside of Databases constructor, so let's query to see if an address has ownership status.

We first have to emulate using web3 and HashFunctions.sol 'keccak256(abi.encodePacked))' which is the hashing technique used within the Database.sol constructor.  
let hashedBytes32 = await HashFunctions.stringAddress('owner', 0x0....8f7a...);  
await Database.boolStorage(hashedBytes32);  
OR  
await Database.boolStorage(await HashFunctions.stringAddress('owner', 0x0....8f7a...));  


## HashFunctions
Hashfunctions.sol is used for hashing desired values into bytes32 key, which is then used for retrieving data from the Database.  HashFunctions has not other purpose other than this, and is not used in the operations of the DaPPs core Smart Contracts, only for communication from the front end to the backend via web3.


## InitialVariables
InitialVariables.sol is executed once, and only once when the full WOM DaPP has been pushed to the public network.  InitializeVariables communicates and creates a bytes32 key with an associate value to be stored in Database.  For this particular instance, we initialize an associate uint ID to a bytes32 hash of what type of oraclize query.  

#### startDapp()
Description: This initializes the initial values that we need within Database to refer to throughout the DaPP.  
Example: await InitialVariables.startDapp();  


## ProfilePortal
ProfilePortal.sol is where .....  

## ProfileAccess
ProfileAccess.sol is used by users to...  


## OracleManager
OracleManager.sol is where the users will initiate, and pay for an [Oraclize](http://app.oraclize.it/home/test_query) query to an API that exists in the traditional sphere.  Oraclize works as a service that listens for events being triggered from their registered oraclizeAPI_05.sol contract, and will then fetch from the requested API the requested data, then pass the returned value into the Smart Contract that initiated the query.  


# Deploying
> Set 3 owners when deploying Database. Any one of these owners will be authorized to deploy the rest of the contracts. All contracts that are deployed must be added to the database through ContractManager.


## Order of deployment:

* Database: args=(ownerOne.address, ownerTwo.address, ownerThree.address)

* HashFunctions: args=(N/A)

* ERC20: args=(TBC)
* ERC223: args=(TBC)

* ContractManager: args=(database.address)
> Database.setContractManager(ContractManager.address)

* InitialVariables: args=(database.address)
> ContractManager.addContract('InitialVariables', InitialVariables.address)
> ContractManager.StartDapp()

* ProfileRegistrar: args=(database.address)
> ContractManager.addContract('ProfileRegistrar', ProfileRegistrar.address)

* ProfileAccess=(database.address)
> ContractManager.addContract('SocialProfileRegistrar', SocialProfileRegistrar.address)

* oraclizeAPI_05: args=(N/A)

* OracleManager: args=(database.address)
> ContractManager.addContract('OracleManager', OracleManager.address)

* Now we need to ensure only the specified contract that have been added into the contractmanager will remain the only contracts able to edit bytes32 keys and their associated value.  So we must call the contractmanager and state that deployment has finished.
> ContractManager.setDeployFinished();
