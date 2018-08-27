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

    LendType 1 == Percentage taken from revenue, platform gets stake back
  */

  function requestTokenLend(
    uint _amount,
    uint _loanPercentage,
    address _lenderAddress,
    bytes32 _functionHash
    )
    whenNotPaused
    nonReentrant
    notEmptyUint(_amount)
    noEmptyAddress(_lenderAddress)
    addressSet(msg.sender)
    addressSet(_lenderAddress)
    noEmptyBytes(_functionHash)
    public
    returns (bool){
      require(levelApproved(uint(1), msg.sender));
      require(levelApproved(uint(1), _lenderAddress));

      require(womToken.balanceOf(_lenderAddress) >= _amount);

      /* Track user request info */
      uint userRequestedCount = database.uintStorage(keccak256(abi.encodePacked('user/loan-request-count', msg.sender))).add(1);
      uint lenderRequestedCount = database.uintStorage(keccak256(abi.encodePacked('user/lender-requested-count', _lenderAddress))).add(1);

      require(updateUserLend(_amount, _lenderAddress, userRequestedCount, lenderRequestedCount, _functionHash));
      require(updateLenderLend(_amount, _lenderAddress, userRequestedCount, lenderRequestedCount, _functionHash));

      // Lender pays stake and generates %
      if(_loanPercentage > 0){
          database.setUint(keccak256(abi.encodePacked('user/request-percentage', msg.sender, userRequestedCount)), _loanPercentage);
          database.setUint(keccak256(abi.encodePacked('user/request-percentage', _lenderAddress, lenderRequestedCount)), _loanPercentage);
      }
      emit LogNewTokenLoanRequest(msg.sender, _amount);
      return true;
    }

  function cancelRequest(
    uint _userRequestedCount
    )
  whenNotPaused
  nonReentrant
  notEmptyUint(_userRequestedCount)
  addressSet(msg.sender)
  public
  returns (bool)
    {
      require(database.addressStorage(keccak256(abi.encodePacked('user/request-lender', msg.sender, _userRequestedCount))) == lenderAddress);

      uint lenderRequestCountAtTime = database.uintStorage(keccak256(abi.encodePacked('user/request-lender-count', msg.sender, _userRequestedCount)));
      address lenderAddress = database.addressStorage(keccak256(abi.encodePacked('user/request-lender', msg.sender, _userRequestedCount)));

      require(database.addressStorage(keccak256(abi.encodePacked('user/lender-request-reciever', lenderAddress, lenderRequestCountAtTime))) == msg.sender);

      require(deleteUserRequest(msg.sender, lenderAddress, _userRequestedCount));


    }

  // Shifts mapping
  function deleteUserRequest(
    address _userAddress,
    address _lenderAddress,
    uint _userRequestedCount)
  internal
  returns (bool)
    {
      uint userCurrentCount = database.uintStorage(keccak256(abi.encodePacked('user/request-count', _userAddress)));
      uint amountRequested = database.uintStorage(keccak256(abi.encodePacked('user/request-amount', _userAddress, _userRequestedCount)));
      uint totalAmountRequested = database.uintStorage(keccak256(abi.encodePacked('user/total-request-amount', _userAddress)));

      /* Move top position to current */
      database.setUint(keccak256(abi.encodePacked('user/request-amount', _userAddress, _userRequestedCount)),
          database.uintStorage(keccak256(abi.encodePacked('user/request-amount', _userAddress, userCurrentCount))
      ));

      database.setAddress(keccak256(abi.encodePacked('user/request-lender', _userAddress, _userRequestedCount)),
          database.addressStorage(keccak256(abi.encodePacked('user/request-lender', _userAddress, userCurrentCount)))
      );

      database.setBytes32(keccak256(abi.encodePacked('user/request-function-hash', _userAddress, _userRequestedCount)),
          database.bytes32Storage(keccak256(abi.encodePacked('user/request-function-hash', _userAddress, userCurrentCount)))
      );

      database.setUint(keccak256(abi.encodePacked('user/total-request-amount', _userAddress)),
          totalAmountRequested.sub(amountRequested)
      );

     database.setUint(keccak256(abi.encodePacked('user/request-count', _userAddress)),
          userCurrentCount.sub(1)
      );


      /* TODO; Could delete the top values, but we've reduced the count, so it will just overwrite. */
      return true;
    }

  function deleteLenderRequest(
    address _userAddress,
    address _lenderAddress,
    uint _userRequestedCount,
    uint _lenderRequestedCount)
  internal
  returns (bool)
    {
      return true;
    }




    /* TODO:
        updateUserLend && updateLenderLend can be broken down into one modular function
        have same hash variable names, but just have a bool that states who is the lender*/
  function updateUserLend(
    uint _amount,
    address _lenderAddress,
    uint _userRequestedCount,
    uint _lenderRequestedCount,
    bytes32 _functionHash)
  internal
  returns (bool){
    database.setUint(keccak256(abi.encodePacked('user/request-count', msg.sender)), _userRequestedCount);
    database.setUint(keccak256(abi.encodePacked('user/request-lender-count', msg.sender, _userRequestedCount)), _lenderRequestedCount);
    database.setUint(keccak256(abi.encodePacked('user/request-amount', msg.sender, _userRequestedCount)), _amount);
    database.setAddress(keccak256(abi.encodePacked('user/request-lender', msg.sender, _userRequestedCount)), _lenderAddress);
    database.setBytes32(keccak256(abi.encodePacked('user/request-function-hash', msg.sender, _userRequestedCount)), _functionHash);
    uint userRequestedAmount = database.uintStorage(keccak256(abi.encodePacked('user/requested-amount', msg.sender)));
    database.setUint(keccak256(abi.encodePacked('user/total-request-amount', msg.sender)), userRequestedAmount.add(_amount));
    return true;
  }

  function updateLenderLend(
    uint _amount,
    address _lenderAddress,
    uint _userRequestedCount,
    uint _lenderRequestedCount,
    bytes32 _functionHash)
  internal
  returns (bool){
    database.setUint(keccak256(abi.encodePacked('user/lender-request-count', _lenderAddress)), _lenderRequestedCount);
    database.setUint(keccak256(abi.encodePacked('user/lender-request-user-count', _lenderAddress, _lenderRequestedCount)), _userRequestedCount);
    database.setUint(keccak256(abi.encodePacked('user/lender-request-amount', _lenderAddress, _lenderRequestedCount)), _amount);
    database.setAddress(keccak256(abi.encodePacked('user/lender-request-reciever', _lenderAddress, _lenderRequestedCount)), msg.sender);
    database.setBytes32(keccak256(abi.encodePacked('user/lender-request-function-hash', _lenderAddress, _lenderRequestedCount)), _functionHash);
    uint lenderRequestAmount = database.uintStorage(keccak256(abi.encodePacked('user/lender-request-amount', _lenderAddress)));
    database.setUint(keccak256(abi.encodePacked('user/lender-request-amount', _lenderAddress)), lenderRequestAmount.add(_amount));
    return true;
  }




  function levelApproved(uint _profileLevel, address _user)
  view
  public
  returns (bool){
    require(database.uintStorage(keccak256(abi.encodePacked("user/profileAccess", _user))) >= uint(_profileLevel));
    require(database.uintStorage(keccak256(abi.encodePacked("user/profileAccessExpiration", _user))) > now);
    return true;
  }

  function notEmptyString(string _param)
  pure
  public
  returns (bool){
    require(bytes(_param).length != 0);
    return true;
  }

  modifier addressSet(address _param){
    require(database.boolStorage(keccak256(abi.encodePacked('address-taken', _param))));
    _;
  }



  // ------------ Modifiers ------------ //
  modifier noEmptyAddress(address _param) {
    require(_param != address(0));
    _;
  }

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
  event LogNewTokenLoanRequest(address indexed _initiator, uint indexed _amount);
}
