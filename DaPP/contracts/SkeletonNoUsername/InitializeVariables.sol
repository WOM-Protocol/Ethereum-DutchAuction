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
    database.setUint(keccak256(abi.encodePacked('updatePriceTime')), 21600); // 6 hours.
    database.setAddress(keccak256(abi.encodePacked('platform/yeay')), 0x0000000000000000000000000000000000000000); //Dead address
    emit LogInitialized(msg.sender, address(database), block.number);
  }

  event LogInitialized(address _sender, address _database, uint _blockNumber);

}
