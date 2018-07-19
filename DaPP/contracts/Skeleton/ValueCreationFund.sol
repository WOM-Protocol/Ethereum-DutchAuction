pragma solidity ^0.4.24;

import './Database.sol';

contract ValueCreationFund {

  Database public database;

  constructor(address _database)
  public {
    database = Database(_database);
  }
}
