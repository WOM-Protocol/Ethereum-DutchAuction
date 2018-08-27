pragma solidity ^0.4.24;

import './Database.sol';
import './ValueCreationFund.sol';

contract ContentCreatorPortal {

  Database public database;
  ValueCreationFund public valueCreationFund;

  constructor(address _database, address _valueCreationFund)
  public {
    database = Database(_database);
    valueCreationFund = ValueCreationFund(_valueCreationFund);
  }
}
