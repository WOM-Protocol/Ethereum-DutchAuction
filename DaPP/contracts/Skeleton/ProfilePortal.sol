pragma solidity ^0.4.24;

import './Database.sol';

contract ProfilePortal {

  Database public database;

  constructor(address _database)
  public {
    database = Database(_database);
  }

  function createProfile(string _userName)
  whenNotPaused
  nonReentrant
  notEmptyString(_userName)
  external
  returns (bool){
    require(!addressSet(msg.sender));
    require(!usernameExists(_userName));
    database.setBool(keccak256(abi.encodePacked('address-taken', msg.sender)), true);
    database.setBool(keccak256(abi.encodePacked('username', _userName)), true);
    database.setBool(keccak256(abi.encodePacked('username/address-assocation', msg.sender, _userName)), true);
    uint newTotalUsers = database.uintStorage(keccak256(abi.encodePacked('total-users'))).add(1);
    database.setUint(keccak256(abi.encodePacked('total-users')), newTotalUsers);
    emit LogNewUserRegistered(msg.sender, newTotalUsers, keccak256(abi.encodePacked(_userName)));
  }


  // ------------ Modifiers ------------ //
  modifier whenNotPaused {
    require(!database.boolStorage(keccak256(abi.encodePacked("pause", this))));
    _;
  }

  modifier nonReentrant() {
    require(!rentrancy_lock);
    rentrancy_lock = true;
    _;
    rentrancy_lock = false;
  }

  modifier notEmptyString(string _param) {
    require(bytes(_param).length != 0);
    _;
  }

  modifier noZeroAddress(address _param) {
    require (_param != address(0));
    _;
  }

  event LogNewUserRegistered(address indexed _userAddress, uint indexed _newTotalUsers, bytes32 indexed _hashUsername);

  function ()
  public {
    revert();
  }
}
