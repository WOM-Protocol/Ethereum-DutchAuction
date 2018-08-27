pragma solidity ^0.4.19;

// This contract is where all long-term data is stored within the Jynx smart-contract system.
contract Database {

// ---------------Storage Variables----------------

    mapping(bytes32 => uint) public uintStorage;
    mapping(bytes32 => string) public stringStorage;
    mapping(bytes32 => address) public addressStorage;
    mapping(bytes32 => bytes) public bytesStorage;
    mapping(bytes32 => bytes32) public bytes32Storage;
    mapping(bytes32 => bool) public boolStorage;
    mapping(bytes32 => int) public intStorage;
    mapping(uint => string) public intToStringStorage;



  // This is the first contract to get deployed. Will store all data + references to other contracts
  constructor(address _ownerOne, address _ownerTwo, address _ownerThree)
      public {
          boolStorage[keccak256(abi.encodePacked('owner', _ownerOne))] = true;
          boolStorage[keccak256(abi.encodePacked('owner', _ownerTwo))] = true;
          boolStorage[keccak256(abi.encodePacked('owner', _ownerThree))] = true;
          emit LogInitialized(_ownerOne, _ownerTwo, _ownerThree);
  }
  // ContractManager will be the only contract that can add/remove contracts on the platform.
  // Invariants: ContractManager address must not be null,   ContractManager must not be set, Only owner can call this function.
  function setContractManager(address _contractManager)
  external {
    require(_contractManager != address(0));
    require(boolStorage[keccak256(abi.encodePacked('owner', msg.sender))]);
    require(addressStorage[keccak256(abi.encodePacked('contract', 'ContractManager'))] == address(0));
    addressStorage[keccak256(abi.encodePacked('contract', 'ContractManager'))] = _contractManager;
    boolStorage[keccak256(abi.encodePacked('contract', _contractManager))] = true;
  }

    // --------------------Set Functions------------------------

    function setAddress(bytes32 _key, address _value)
    onlyRegisteredContract
    external {
        addressStorage[_key] = _value;
    }

    function setUint(bytes32 _key, uint _value)
    onlyRegisteredContract
    external {
        uintStorage[_key] = _value;
    }

    function setString(bytes32 _key, string _value)
    onlyRegisteredContract
    external {
        stringStorage[_key] = _value;
    }

    function setBytes(bytes32 _key, bytes _value)
    onlyRegisteredContract
    external {
        bytesStorage[_key] = _value;
    }

    function setBytes32(bytes32 _key, bytes32 _value)
    onlyRegisteredContract
    external {
        bytes32Storage[_key] = _value;
    }

    function setBool(bytes32 _key, bool _value)
    onlyRegisteredContract
    external {
        boolStorage[_key] = _value;
    }

    function setInt(bytes32 _key, int _value)
    onlyRegisteredContract
    external {
        intStorage[_key] = _value;
    }

    function setIntToString(uint _key, string _value)
    onlyRegisteredContract
    external {
        intToStringStorage[_key] = _value;
    }


     // -------------- Deletion Functions ------------------

    function deleteAddress(bytes32 _key)
    onlyRegisteredContract
    external {
        delete addressStorage[_key];
    }

    function deleteUint(bytes32 _key)
    onlyRegisteredContract
    external {
        delete uintStorage[_key];
    }

    function deleteString(bytes32 _key)
    onlyRegisteredContract
    external {
        delete stringStorage[_key];
    }

    function deleteBytes(bytes32 _key)
    onlyRegisteredContract
    external {
        delete bytesStorage[_key];
    }

    function deleteBytes32(bytes32 _key)
    onlyRegisteredContract
    external {
        delete bytes32Storage[_key];
    }

    function deleteBool(bytes32 _key)
    onlyRegisteredContract
    external {
        delete boolStorage[_key];
    }

    function deleteInt(bytes32 _key)
    onlyRegisteredContract
    external {
        delete intStorage[_key];
    }

    function deleteIntToString(uint _key)
    onlyRegisteredContract
    external {
        delete intToStringStorage[_key];
    }


    // Caller must be registered as a contract within the WOM Dapp
    modifier onlyRegisteredContract() {
        require(boolStorage[keccak256(abi.encodePacked('contract', msg.sender))]);
        _;
    }

    event LogInitialized(address indexed _ownerOne, address indexed _ownerTwo, address indexed _ownerThree);
}
