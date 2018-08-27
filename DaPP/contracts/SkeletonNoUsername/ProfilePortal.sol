pragma solidity ^0.4.24;

import './Database.sol';
import '../Libraries/SafeMath.sol';


contract ProfilePortal {
  using SafeMath for *;

  Database public database;
  bool private rentrancy_lock = false;

  constructor(address _database)
  public {
    database = Database(_database);
  }

  function createProfile()
  whenNotPaused
  nonReentrant
  external
  returns (bool){
    require(!addressSet(msg.sender));
    database.setBool(keccak256(abi.encodePacked('address-taken', msg.sender)), true);
    uint newTotalUsers = database.uintStorage(keccak256(abi.encodePacked('total-users'))).add(1);
    database.setUint(keccak256(abi.encodePacked('total-users')), newTotalUsers);
    emit LogNewUserRegistered(msg.sender, newTotalUsers, now);
  }


  function addressSet(address _param)
  view
  public
  returns (bool){
    return database.boolStorage(keccak256(abi.encodePacked('address-taken', _param)));
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

  event LogNewUserRegistered(address indexed _userAddress, uint indexed _newTotalUsers, uint indexed _timestamp);

  function ()
  public {
    revert();
  }
}
