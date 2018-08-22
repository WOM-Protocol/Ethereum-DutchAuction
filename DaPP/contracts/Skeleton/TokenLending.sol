pragma solidity ^0.4.24;

// ---------------- Contracts ------------- //
import './Database.sol';
import '../ERC20/ERC20BurnableAndMintable.sol';

// ---------------- Libraries ------------- //
import '../Libraries/SafeMath.sol';


contract TokenLending {
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
    TODO; Keep track of amount of stake, and the address associated and each time they generate
    an income the stake amount is taken from the revenue.  Then thereafter, the revenue
    associated address gets the rest.
    - Keep track of requested amount.
    - User address and username that requested stake lend
    - Amount of requested amount


    1 - Platform pays for stake, and if user generates an income the stake is taken out of that
    2 - Platform pays for stake, takes stake back and % of revenue
    3 - User pays for stake, and gets revenue

    LendType 1 == Percentage taken from revenue
  */

  function requestTokenLend(string _userName, uint _amount, uint _loanPercentage, string _lenderUsername, uint _lendType)
  whenNotPaused
  nonReentrant
  notEmptyUint(_amount)
  notEmptyUint(_lendType)
  public
  returns (bool){
    require(notEmptyString(_userName));
    require(notEmptyString(_lenderUsername));

    require(usernameExists(_userName));
    require(usernameExists(_lenderUsername));

    require(levelApproved(uint(1), _userName));
    require(levelApproved(uint(1), _lenderUsername));

    require(addressAssociatedWithUsername(_userName));
    require(database.boolStorage(keccak256(abi.encodePacked('username/address-types-set', _userName))));

    if(_lendType == 1){
      require(_loanPercentage > 0);
    }

    address platformStaking = database.addressStorage(keccak256(abi.encodePacked('username/address-staking', _lenderUsername)));
    require(womToken.balanceOf(platformStaking) >= _amount);

    // Track user request info
    uint userRequestedCount = database.uintStorage(keccak256(abi.encodePacked('username/loan-requested-count', _userName)));
    database.setUint(keccak256(abi.encodePacked('username/loan-requested-count', _userName)), userRequestedCount.add(1));
    database.setString(keccak256(abi.encodePacked('username/loan-request-lender', _userName, userRequestedCount)), _lenderUsername);
    uint userRequestedAmount = database.uintStorage(keccak256(abi.encodePacked('username/loan-requested-amount', _userName)));
    database.setUint(keccak256(abi.encodePacked('username/loan-requested-amount', _userName)), userRequestedAmount.add(_amount));

    // Track lender request info
    uint lenderRequestCount = database.uintStorage(keccak256(abi.encodePacked('username/lender-requested-count', _lenderUsername)));
    database.setUint(keccak256(abi.encodePacked('username/lender-requested-count', _lenderUsername)), lenderRequestCount.add(1));
    database.setString(keccak256(abi.encodePacked('username/lender-request-reciever', _lenderUsername, lenderRequestCount)), _userName);
    uint lenderRequestAmount = database.uintStorage(keccak256(abi.encodePacked('username/lender-requested-amount', _lenderUsername)));
    database.setUint(keccak256(abi.encodePacked('username/lender-requested-amount', _lenderUsername)), lenderRequestAmount.add(_amount));

    // Lender pays stake and generates %
    if(_lendType == 1 && _loanPercentage != 0){
        database.setUint(keccak256(abi.encodePacked('username/loan-requested-percentage', _userName, userRequestedCount)), _loanPercentage);
        database.setUint(keccak256(abi.encodePacked('username/lender-requested-percentage', _lenderUsername, lenderRequestCount)), _loanPercentage);
    }
    emit LogNewTokenLoanRequest(msg.sender, _amount, _lendType);
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
  event LogNewTokenLoanRequest(address indexed _initiator, uint indexed _amount, uint _lendType);
}
