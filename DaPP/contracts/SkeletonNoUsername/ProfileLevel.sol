pragma solidity ^0.4.24;

import './Database.sol';

contract ProfileLevel {

  Database public database;
  bool private rentrancy_lock = false;
  uint public oneYearExpiry = uint(31536000);


  constructor(address _database)
  public {
    database = Database(_database);
  }

  /*
      1 - KYC/creator
      2 - Curator
      3 - Campaign Manager
      4 - Platform
  */

  function approveUser(address _newUser, uint _profileAccess)
  anyOwner
  nonReentrant
  whenNotPaused
  noEmptyAddress(_newUser)
  external
  returns (bool) {
    require(_profileAccess != uint(0) && _profileAccess <= uint(4));
    database.setUint(keccak256(abi.encodePacked("user/profileAccess", _newUser)), _profileAccess);
    uint expiry = now + oneYearExpiry;
    assert (expiry > now && expiry > oneYearExpiry);   // Check for overflow
    database.setUint(keccak256(abi.encodePacked("user/profileAccessExpiration", _newUser)), expiry);
    emit LogUserApproved(_newUser, _profileAccess);
    return true;
  }


  function removeUser(address _user)
  anyOwner
  nonReentrant
  whenNotPaused
  noEmptyAddress(_user)
  external
  returns (bool) {
    database.deleteUint(keccak256(abi.encodePacked("user/profileAccess", _user)));
    database.deleteUint(keccak256(abi.encodePacked("user/profileAccessExpiration", _user)));
    emit LogUserRemoved(_user, now);
    return true;
  }

  // ------------ Modifiers ------------ //
  modifier noEmptyAddress(address _param) {
    require(_param != address(0));
    _;
  }

  modifier anyOwner {
    require(database.boolStorage(keccak256(abi.encodePacked("owner", msg.sender))));
    _;
  }

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

  // ------------ Events ------------ //
  event LogUserApproved(address indexed _user, uint indexed _profileLevel);
  event LogUserRemoved(address indexed _user, uint indexed _timestamp);
}
