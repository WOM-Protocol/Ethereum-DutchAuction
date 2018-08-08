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

  function addPendingAddress(string _userName, address _additionalAddress)
  whenNotPaused
  nonReentrant
  notEmptyString(_userName)
  noZeroAddress(_additionalAddress)
  external
  returns (bool){
    require(!addressSet(_additionalAddress));
    require(addressSet(msg.sender));
    require(usernameExists(_userName));
    require(addressAssociatedWithUsername(_userName));
    database.setAddress(keccak256(abi.encodePacked('username/pending-address', _userName)), _additionalAddress);
    emit LogPendingAddressAdded(msg.sender, _additionalAddress, keccak256(abi.encodePacked(_userName)));
  }

  function verifyPendingAddress(string _userName)
  whenNotPaused
  nonReentrant
  notEmptyString(_userName)
  external
  returns (bool){
    require(usernameExists(_userName));
    require(!addressSet(msg.sender));
    require(database.addressStorage(keccak256(abi.encodePacked('username/pending-address', _userName))) == msg.sender);
    uint userNameAddressCount = database.uintStorage(keccak256(abi.encodePacked('username/address-count', _userName))).add(1);
    database.setBool(keccak256(abi.encodePacked('address-taken', msg.sender)), true);
    database.setBool(keccak256(abi.encodePacked('username/address-assocation', msg.sender, _userName)), true);
    database.setUint(keccak256(abi.encodePacked('username/address-position', msg.sender)), userNameAddressCount);
    database.setAddress(keccak256(abi.encodePacked('username/address-with-position', _userName, userNameAddressCount)), msg.sender);
    database.setUint(keccak256(abi.encodePacked('username/address-count', _userName)), userNameAddressCount);
    database.deleteAddress(keccak256(abi.encodePacked('username/pending-address', _userName)));
    emit LogPendingAddressVerified(msg.sender, keccak256(abi.encodePacked(_userName)));
  }

  // ---------------- View Functions ------------- //
  function addressAssociatedWithUsername(string _userName)
  whenNotPaused
  notEmptyString(_userName)
  view
  public
  returns (bool){
    return database.boolStorage(keccak256(abi.encodePacked('username/address-assocation', msg.sender, _userName)));
  }


  function usernameExists(string _userName)
  whenNotPaused
  notEmptyString(_userName)
  view
  public
  returns (bool){
    return database.boolStorage(keccak256(abi.encodePacked('username', _userName)));
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

  event LogNewUserRegistered(address indexed _userAddress, uint indexed _newTotalUsers, bytes32 indexed _hashUsername);
  event LogPendingAddressAdded(address indexed _userAddress, address indexed _additionalAddress, bytes32 indexed _hashUsername);
  event LogPendingAddressVerified(address indexed _additionalAddress, bytes32 indexed _hashUsername);
  event LogAddressRemoved(address indexed _userAddress, address indexed _additionalAddress, bytes32 indexed _hashUsername);

  function ()
  public {
    revert();
  }
}
