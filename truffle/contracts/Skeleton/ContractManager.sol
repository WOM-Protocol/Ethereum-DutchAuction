pragma solidity 0.4.24;

import "./Database.sol";

contract ContractManager{
  Database public database;

  constructor(address _database)
  public
  noEmptyAddress(_database) {
    database = Database(_database);
  }


  function setDeployFinished()
  external
  anyOwner {
    database.setBool(keccak256("deployFinished"), true);
  }

  function addContract(string _name, address _contractAddress, address _functionSigner)
  external
  noEmptyAddress(_contractAddress)
  noEmptyString(_name)
  anyOwner {
    require(msg.sender != _functionSigner);
    require(database.boolStorage(keccak256(this, _functionSigner, "addContract", keccak256(_contractAddress))) || database.boolStorage(keccak256("deployFinished")) == false);
    require(!contractExists(_contractAddress));
    require(database.addressStorage(keccak256(abi.encodePacked("contract", _name))) == address(0));
    database.setBool(keccak256(abi.encodePacked(this, _functionSigner, "addContract", keccak256(abi.encodePacked(_contractAddress)))), false);
    database.setAddress(keccak256(abi.encodePacked("contract", _name)), _contractAddress);
    database.setBool(keccak256(abi.encodePacked("contract", _contractAddress)), true);
    emit LogContractAdded(_contractAddress, _name, block.number);
  }

  function removeContract(string _name, address _functionSigner)
  external
  noEmptyString(_name)
  multiSigRequired(_functionSigner, "removeContract", keccak256(_name))
  anyOwner {
    address contractToDelete = database.addressStorage(keccak256("contract", _name));
    require(contractExists(contractToDelete));
    database.deleteBool(keccak256("contract", contractToDelete));
    database.deleteAddress(keccak256("contract", _name));
    emit LogContractRemoved(contractToDelete, _name, block.number);
  }

  function updateContract(string _name, address _newContractAddress, address _functionSigner)
  external
  noEmptyAddress(_newContractAddress)
  multiSigRequired(_functionSigner, "updateContract", keccak256(_newContractAddress))
  anyOwner {
    address oldAddress = database.addressStorage(keccak256("contract", _name));
    require (contractExists(oldAddress));
    database.setAddress(keccak256("contract", _name), _newContractAddress);
    database.setBool(keccak256("contract", _newContractAddress), true);
    database.deleteBool(keccak256("contract", oldAddress));
    emit LogContractUpdated(oldAddress, _name, block.number);
    emit LogNewContractLocation(_newContractAddress, _name, block.number);
  }

  function contractExists(address _contract)
  public
  view
  returns (bool){
    return database.boolStorage(keccak256(abi.encodePacked("contract", _contract)));
  }

  // ------------------------------------------------------------------------------------------------
  //                                                Modifiers
  // ------------------------------------------------------------------------------------------------


  modifier anyOwner {
    require(database.boolStorage(keccak256(abi.encodePacked("owner", msg.sender))));
    _;
  }

  modifier noEmptyAddress(address _contract) {
    require(_contract != address(0));
    _;
  }

  modifier noEmptyString(string _name) {
    require(bytes(_name).length != 0);
    _;
  }

  modifier multiSigRequired(address _signer, string _functionName, bytes32 _keyParam) {
    require(msg.sender != _signer);
    require(database.boolStorage(keccak256(abi.encodePacked(this, _signer, _functionName, _keyParam))));
    database.setBool(keccak256(abi.encodePacked(this, _signer, _functionName, _keyParam)), false);
    _;
  }


  // ------------------------------------------------------------------------------------------------
  //                                    Events
  // ------------------------------------------------------------------------------------------------
  event LogContractAdded(address _contractAddress, string _name, uint _blockNumber);
  event LogContractRemoved(address contractToDelete, string _name, uint _blockNumber);
  event LogContractUpdated(address oldAddress, string _name, uint _blockNumber);
  event LogNewContractLocation(address _contractAddress, string _name, uint _blockNumber);
}
