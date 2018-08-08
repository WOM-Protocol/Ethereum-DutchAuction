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
    string memory usernameAssociated = database.stringStorage(keccak256(abi.encodePacked('username/address-associated', msg.sender)));
    require(notEmptyString(usernameAssociated));
    require(addressAssociatedWithUsername(usernameAssociated));
    database.setUint(keccak256(abi.encodePacked("username/profileAccess", usernameAssociated)), _profileAccess);
    uint expiry = now + oneYearExpiry;
    assert (expiry > now && expiry > oneYearExpiry);   // Check for overflow
    database.setUint(keccak256(abi.encodePacked("username/profileAccessExpiration", usernameAssociated)), expiry);
    emit LogUserApproved(_newUser, _profileAccess);
    return true;
  }


  function removeUser(address _user)
  anyOwner
  nonReentrant
  whenNotPaused
  external
  returns (bool) {
    string memory usernameAssociated = database.stringStorage(keccak256(abi.encodePacked('username/address-associated', msg.sender)));
    require(notEmptyString(usernameAssociated));
    require(addressAssociatedWithUsername(usernameAssociated));
    uint profileLevel = database.uintStorage(keccak256(abi.encodePacked("profileAccess", usernameAssociated)));
    database.deleteUint(keccak256(abi.encodePacked("username/profileAccess", usernameAssociated)));
    database.deleteUint(keccak256(abi.encodePacked("username/profileAccessExpiration", usernameAssociated)));
    emit LogUserRemoved(_user, profileLevel);
    return true;
  }




  // ------------ View Functions ------------ //
  function notEmptyString(string _param)
  pure
  public
  returns (bool){
    require(bytes(_param).length != 0);
    return true;
  }

  function addressAssociatedWithUsername(string _userName)
  view
  public
  returns (bool){
    return database.boolStorage(keccak256(abi.encodePacked('username/address-assocation', msg.sender, _userName)));
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
  event LogUserRemoved(address indexed _user, uint indexed _profileLevel);
}
