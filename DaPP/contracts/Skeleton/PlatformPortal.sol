pragma solidity ^0.4.24;

// ---------------- Contracts ------------- //
import './Database.sol';

// ---------------- Libraries ------------- //
import '../Libraries/SafeMath.sol';


contract PlatformPortal {
  using SafeMath for *;

  Database public database;
  bool private rentrancy_lock = false;


  constructor(address _database)
  public {
    database = Database(_database);
  }


  function assignStakingAddress()
  public
  returns (bool){
    return true;
  }

  function assignRevenueAddress()
  public
  returns (bool){
    return true;
  }

  function assignInterestAddress()
  public
  returns (bool){
    return true;
  }
}
