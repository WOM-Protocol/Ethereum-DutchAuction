pragma solidity ^0.4.24;

// ---------------- Contracts ------------- //
import './Database.sol';
import '../ERC20/ERC20BurnableAndMintable.sol';

// ---------------- Libraries ------------- //
import '../Libraries/SafeMath.sol';


contract Staking {
  using SafeMath for *;

  Database public database;
  bool private rentrancy_lock = false;
  ERC20BurnableAndMintable public womToken;
  uint public stakingExpiry = uint(604800);     // One-week
  // 2678400 - 1 month


  constructor(address _database, address _womToken)
  public {
    database = Database(_database);
    womToken = ERC20BurnableAndMintable(_womToken);
  }

  /*
    Platform specifies their desired address to withdraw from
  */

  function requestTokenLend(uint _amount, uint _platformPercentage, uint _duration, string _platformUsername, bytes32 _lendType)
  whenNotPaused
  nonReentrant
  notEmptyUint(_amount)
  notEmptyUint(_duration)
  noEmptyBytes(_lendType)
  public
  returns (bool){
    require(usernameExists(_platformUsername));
    string memory usernameAssociated = database.stringStorage(keccak256(abi.encodePacked('username/address-associated', msg.sender)));
                // User validation //
    require(notEmptyString(usernameAssociated));
    usernameExists(usernameAssociated);
    require(addressAssociatedWithUsername(usernameAssociated));
    require(levelApproved(uint(1), usernameAssociated));
                // Platforms validation //
    require(levelApproved(uint(4), _platformUsername));
    //address platformAddress = database.addressStorage(keccak256(abi.encodePacked('username/address-with-position', _platformUsername, uint(0))));

    //database.setUint(keccak256(abi.encodePacked('platform/request-count', msg.sender)), userNameAddressCount);


    //require(womToken.balanceOf(platformAddress) >= _amount);


    /*
      Keep count of all requests for Stake
      User address and username that requested stake lend
      amount of requested amount

    */

    return true;
  }

  // ------------ View Functions ------------ //
  function addressAssociatedWithUsername(string _userName)
  view
  public
  returns (bool){
    return database.boolStorage(keccak256(abi.encodePacked('username/address-assocation', msg.sender, _userName)));
  }

  function usernameExists(string _userName)
  whenNotPaused
  view
  public
  returns (bool){
    notEmptyString(_userName);
    return database.boolStorage(keccak256(abi.encodePacked('username', _userName)));
  }

  function levelApproved(uint _profileLevel, string _userName)
  view
  public
  returns (bool){
    require(database.uintStorage(keccak256(abi.encodePacked("username/profileAccess", _userName))) >= uint(_profileLevel));
    require(database.uintStorage(keccak256(abi.encodePacked("username/profileAccessExpiration", _userName))) > now);
    return true;
  }

  function notEmptyString(string _param)
  pure
  public
  returns (bool){
    require(bytes(_param).length != 0);
    return true;
  }


  // ------------ Modifiers ------------ //
  modifier notEmptyUint(uint _param){
    require(_param != 0 && _param > 0);
    _;
  }

  modifier noEmptyBytes(bytes32 _data) {
    require(_data != bytes32(0));
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


/*
1: Just Staker alone generates the revenue
	2: Staker can pay for some other creator and creator generates revenue
	3: Staker can pay for another creator, and pass in an interest rate
  Lending tokens, 30 > 60 days implementation.
  YEAY owns content right when publishing it to WOMToken, and they
  promise the user to pay them back, and if they do not claim the tokens YEAY owns the tokens.

*/

}
