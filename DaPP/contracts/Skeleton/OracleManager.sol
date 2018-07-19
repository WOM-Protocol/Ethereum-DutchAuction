pragma solidity ^0.4.24;

// ----------- Libraries ----------- //

// ----------- Contracts ----------- //
import './oraclizeAPI_05.sol';
import './Database.sol';

contract OracleManager is usingOraclize{

  Database public database;
  bool private rentrancy_lock = false;


  constructor(address _database)
  public {
    database = Database(_database);
  }

  // ------------ Modifiers ------------ //
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

  modifier notEmptyString(string _param) {
    require(bytes(_param).length != 0);
    _;
  }

  modifier isOraclize() {
   require(msg.sender == oraclize_cbAddress());
   _;
  }

  event LogGitHubOracleQuery(address indexed _userAddress, bytes32 indexed _queryID, uint indexed _timestamp);
  event LogGitHubSuccessfulCallBack(bytes32 indexed _queryID, bool _verified, bytes _userName);
  }
