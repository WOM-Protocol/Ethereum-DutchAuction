pragma solidity ^0.4.24;

// ----------- Libraries ----------- //
import '../Libraries/SafeMath.sol';

// ----------- Contracts ----------- //
import './Database.sol';
import '../ERC20/ERC20BurnableAndMintable.sol';


/*
  Reputation token and WOM token are worth the same. RP tokens can be bought with WOM tokens.
   The other way around is possible as well: Reputation tokens can be exchanged into WOM tokens.
   The exchange may take place with the platform that holds WOM token in reserve for each
   distributed reputation token. However, exchanging between RP and WOM tokens is limited
    in several parameters like amount and time. Details are explained in the following sections.

*/

contract TokenExchange{
  using SafeMath for *;

  Database public database;
  bool private rentrancy_lock = false;
  ERC20BurnableAndMintable public womToken;
  ERC20BurnableAndMintable public rpToken;

  constructor(address _database, address _womToken, address _rpToken)
  public {
    database = Database(_database);
    womToken = ERC20BurnableAndMintable(_womToken);
    rpToken = ERC20BurnableAndMintable(_rpToken);
  }

  function convertYeayPointsToWOM(
    address _to,
    uint _amount,
    bytes _ipfsHash
    )
  nonReentrant
  whenNotPaused
  public
  returns (bool){
    require(levelApproved(uint(4), msg.sender));
    require(levelApproved(uint(1), _to));

    require(msg.sender == database.addressStorage(keccak256(abi.encodePacked('platform/yeay'))));

    require(womToken.balanceOf(msg.sender) >= _amount);
    require(womToken.transfer(_to, _amount));

    uint totalConversionAmount = database.uintStorage(keccak256(abi.encodePacked('platform/yeay-conversion-amount')));
    uint totalConversions = database.uintStorage(keccak256(abi.encodePacked('platform/yeay-total-conversions')));

    database.setBytes(keccak256(abi.encodePacked('platform/yeay-conversion-hash', totalConversions)), _ipfsHash);
    database.setUint(keccak256(abi.encodePacked('platform/yeay-total-conversions')), totalConversions.add(1));
    database.setUint(keccak256(abi.encodePacked('platform/yeay-conversion-amount')), totalConversionAmount.add(_amount));
    emit LogYeayPointConversionToWom(msg.sender, _to, _amount);
    return true;
  }


  // ------------ View/Pure functions ------------ //
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



  // ------------ Modifiers ------------ //
  modifier noEmptyAddress(address _param) {
    require(_param != address(0));
    _;
  }

  modifier addressSet(address _param){
    require(database.boolStorage(keccak256(abi.encodePacked('address-taken', _param))));
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

  event LogYeayPointConversionToWom(address indexed _from, address indexed _to, uint indexed _amount);
}
