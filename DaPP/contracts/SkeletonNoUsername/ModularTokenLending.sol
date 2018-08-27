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
    uint userRequestedCount = database.uintStorage(keccak256(abi.encodePacked('lending/count', msg.sender))).add(1);
    uint lenderRequestedCount = database.uintStorage(keccak256(abi.encodePacked('lending/count', _lenderAddress))).add(1);

    require(
      updateLend(_amount, msg.sender, _lenderAddress, userRequestedCount, lenderRequestedCount, _functionHash, false, false, 0) &&   // Updates users storage
      updateLend(_amount, _lenderAddress, msg.sender, lenderRequestedCount, userRequestedCount, _functionHash, true, false, 0)      // Updates lender storage
      );

    // Lender pays stake and generates %
    if(_loanPercentage > 0){
        database.setUint(keccak256(abi.encodePacked('user/request-percentage', msg.sender, userRequestedCount)), _loanPercentage);
        database.setUint(keccak256(abi.encodePacked('user/request-percentage', _lenderAddress, lenderRequestedCount)), _loanPercentage);
    }
    emit LogNewTokenLoanRequest(msg.sender, _amount);
    return true;
  }

  function removeRequest(
    address _userAddress,
    address _lenderAddress,
    uint _userRequestedCount,
    uint _lenderRequestedCount,
    bool _lender)
  public
  addressSet(msg.sender)
  addressSet(_lenderAddress)
  notEmptyUint(_userRequestedCount)
  notEmptyUint(_lenderRequestedCount)
  returns (bool){
    require(levelApproved(uint(1), msg.sender));
    require(levelApproved(uint(1), _lenderAddress));

    require(msg.sender == _userAddress || msg.sender == _lenderAddress);

    require(database.addressStorage(keccak256(abi.encodePacked('lending/lender', _userAddress, _userRequestedCount))) == _lenderAddress);
    require(database.addressStorage(keccak256(abi.encodePacked('lending/lender', _lenderAddress, _lenderRequestedCount))) == _userAddress);

    uint userCurrentCount = database.uintStorage(keccak256(abi.encodePacked('lending/count', _userAddress)));
    uint lenderCurrentCount = database.uintStorage(keccak256(abi.encodePacked('lending/count', _lenderAddress)));


    require(deletionLend(
        database.uintStorage(keccak256(abi.encodePacked('lending/amount', _userAddress, _userRequestedCount))),
        _userAddress));
/*    require(
      updateLend(
          database.uintStorage(keccak256(abi.encodePacked('lending/amount', _userAddress, userCurrentCount))),
          _userAddress,
          _lenderAddress,
          _userRequestedCount,
          _lenderRequestedCount,
          database.bytes32Storage(keccak256(abi.encodePacked('lending/function-hash', _userAddress, userCurrentCount))),
          false,
          true,
          userCurrentCount.sub(1)));
    /*
    &&
    deletionLend(
        database.uintStorage(keccak256(abi.encodePacked('lending/amount', _lenderAddress, _userRequestedCount))),
        _lenderAddress)
    &&
    updateLend(
        database.uintStorage(keccak256(abi.encodePacked('lending/amount', _userAddress, lenderCurrentCount))),
        _lenderAddress,
        _userAddress,
        _lenderRequestedCount,
        _userRequestedCount,
        database.bytes32Storage(keccak256(abi.encodePacked('lending/function-hash', _userAddress, lenderCurrentCount))),
        true,
        true,
        lenderCurrentCount.sub(1))
    );
    */
      return true;
  }


  function updateLend(
    uint _amount,
    address _address1,
    address _address2,
    uint _addressCount1,
    uint _addressCount2,
    bytes32 _functionHash,
    bool _lender,
    bool _deletion,
    uint _addressCountNewMax)
  internal
  returns (bool){
    database.setUint(keccak256(abi.encodePacked('lending/amount', _address1, _addressCount1)), _amount);
    database.setAddress(keccak256(abi.encodePacked('lending/address-association', _address1, _addressCount1)), _address2);
    database.setUint(keccak256(abi.encodePacked('lending/address-association-count', _address1, _addressCount1)), _addressCount2);
    database.setBytes32(keccak256(abi.encodePacked('lending/function-hash', _address1, _addressCount1)), _functionHash);
    database.setBool(keccak256(abi.encodePacked('lending/lender', _address1, _addressCount1)), _lender);

    if(!_deletion){
      database.setUint(keccak256(abi.encodePacked('lending/count', _address1)), _addressCount1);
      uint userRequestedAmount = database.uintStorage(keccak256(abi.encodePacked('lending/total-amount', _address1)));
      database.setUint(keccak256(abi.encodePacked('lending/total-amount', _address1)), userRequestedAmount.add(_amount));
    }
    else{
      require(_addressCountNewMax != 0);
      database.setUint(keccak256(abi.encodePacked('lending/count', _address1)), _addressCountNewMax);
    }
    return true;
  }


  function deletionLend(
    uint _amountToRemove,
    address _address1)
  internal
  returns(bool){
    uint userRequestedAmount = database.uintStorage(keccak256(abi.encodePacked('lending/total-amount', _address1)));
    database.setUint(keccak256(abi.encodePacked('lending/total-amount', _address1)), userRequestedAmount.sub(_amountToRemove));
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
