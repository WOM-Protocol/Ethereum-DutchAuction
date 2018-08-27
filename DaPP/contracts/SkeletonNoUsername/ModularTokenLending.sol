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
      updateLend(_amount, msg.sender, _lenderAddress, userRequestedCount, lenderRequestedCount, _functionHash, false, true) &&   // Updates users storage
      updateLend(_amount, _lenderAddress, msg.sender, lenderRequestedCount, userRequestedCount, _functionHash, true, true)      // Updates lender storage
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
  addressSet(msg.sender)
  addressSet(_lenderAddress)
  notEmptyUint(_userRequestedCount)
  notEmptyUint(_lenderRequestedCount)
  public
  returns (bool){
    require(levelApproved(uint(1), msg.sender));
    require(levelApproved(uint(1), _lenderAddress));

    require(database.boolStorage(keccak256(abi.encodePacked('lending/active-request', _userAddress, _userRequestedCount))));
    require(database.boolStorage(keccak256(abi.encodePacked('lending/active-request', _lenderAddress, _lenderRequestedCount))));

    require(msg.sender == _userAddress || msg.sender == _lenderAddress);

    require(database.addressStorage(keccak256(abi.encodePacked('lending/lender', _userAddress, _userRequestedCount))) == _lenderAddress);
    require(database.addressStorage(keccak256(abi.encodePacked('lending/lender', _lenderAddress, _lenderRequestedCount))) == _userAddress);

    uint userCurrentCount = database.uintStorage(keccak256(abi.encodePacked('lending/count', _userAddress)));
    uint lenderCurrentCount = database.uintStorage(keccak256(abi.encodePacked('lending/count', _lenderAddress)));



    require(deletionLend(database.uintStorage(keccak256(abi.encodePacked('lending/amount', _userAddress, _userRequestedCount))),_userAddress));
    require(deletionLend(database.uintStorage(keccak256(abi.encodePacked('lending/amount', _lenderAddress, _userRequestedCount))),_lenderAddress));

    database.deleteBool(keccak256(abi.encodePacked('lending/active-request', _userAddress, _userRequestedCount)));
    database.deleteBool(keccak256(abi.encodePacked('lending/active-request', _lenderAddress, _lenderRequestedCount)));
    emit LogRequestRemoved(_userAddress, _lenderAddress, now);
    return true;
  }


  function acceptRequest(
    uint _lenderRequestedCount,
    bool _lender)
    addressSet(msg.sender)
    notEmptyUint(_lenderRequestedCount)
    public
    returns (bool){
      require(levelApproved(uint(1), msg.sender));

      require(database.boolStorage(keccak256(abi.encodePacked('lending/active-request', msg.sender, _lenderRequestedCount))));
      require(database.boolStorage(keccak256(abi.encodePacked('lending/lender', msg.sender, _lenderRequestedCount))));
      uint requestedAmount = database.uintStorage(keccak256(abi.encodePacked('lending/amount', msg.sender, _lenderRequestedCount)));

      require(womToken.balanceOf(msg.sender) > requestedAmount);
      address userRequestedAddress = database.addressStorage(keccak256(abi.encodePacked('lending/address-association', msg.sender, _lenderRequestedCount)));
      uint userRequestedCount = database.uintStorage(keccak256(abi.encodePacked('lending/address-association-count', msg.sender, _lenderRequestedCount)));

      require(database.addressStorage(keccak256(abi.encodePacked('address-association', userRequestedAddress, userRequestedCount))) == msg.sender);

      /*  Transfer funds for specific function */
      emit LogRequestAccepted(userRequestedAddress, msg.sender, requestedAmount);
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
    bool _active)
  internal
  returns (bool){
    database.setUint(keccak256(abi.encodePacked('lending/amount', _address1, _addressCount1)), _amount);
    database.setAddress(keccak256(abi.encodePacked('lending/address-association', _address1, _addressCount1)), _address2);
    database.setUint(keccak256(abi.encodePacked('lending/address-association-count', _address1, _addressCount1)), _addressCount2);
    database.setBytes32(keccak256(abi.encodePacked('lending/function-hash', _address1, _addressCount1)), _functionHash);
    database.setBool(keccak256(abi.encodePacked('lending/lender', _address1, _addressCount1)), _lender);
    database.setBool(keccak256(abi.encodePacked('lending/active-request', _address1, _addressCount1)), _active);


    database.setUint(keccak256(abi.encodePacked('lending/count', _address1)), _addressCount1);
    uint userRequestedAmount = database.uintStorage(keccak256(abi.encodePacked('lending/total-amount', _address1)));
    database.setUint(keccak256(abi.encodePacked('lending/total-amount', _address1)), userRequestedAmount.add(_amount));
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
    require(database.uintStorage(keccak256(abi.encodePacked('user/profileAccess', _user))) >= uint(_profileLevel));
    require(database.uintStorage(keccak256(abi.encodePacked('user/profileAccessExpiration', _user))) > now);
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
    require(!database.boolStorage(keccak256(abi.encodePacked('pause', this))));
    _;
  }

  modifier nonReentrant() {
    require(!rentrancy_lock);
    rentrancy_lock = true;
    _;
    rentrancy_lock = false;
  }

  event LogNewTokenLoanRequest(address indexed _initiator, uint indexed _amount);
  event LogRequestRemoved(address indexed _userAddress, address indexed _lenderAddress, uint indexed now);
  event LogRequestAccepted(address indexed _userAddress, address indexed _lenderAddress, uint indexed _requestedAmount);
}
