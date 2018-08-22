pragma solidity ^0.4.24;

import './Database.sol';

contract InitializeVariables {

Database public database;

  constructor(address _database)
  public {
    database = Database(_database);
  }

  function startDapp(address _valueCreationFund)
  external  {
    database.setAddress(keccak256(abi.encodePacked('ValueCreationFund')), _valueCreationFund);
    emit LogInitialized(msg.sender, address(database), block.number);
  }

  event LogInitialized(address _sender, address _database, uint _blockNumber);

}
