pragma solidity ^0.4.24;

// ----------- Libraries ----------- //

// ----------- Contracts ----------- //
import './oraclizeAPI_05.sol';
import './Database.sol';

contract OracleManager is usingOraclize{

  Database public database;
  bool private rentrancy_lock = false;

  /* For oraclize calls localhost */
  address public OAR;

  constructor(address _database)
  public {
    database = Database(_database);
    OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475); // Localhost Testing
  }


  function priceUSDEther()
  public
  returns (bool){
    bytes32 queryID = oraclize_query('URL', 'json(https://api.coinmarketcap.com/v1/ticker/ethereum/).0.price_usd');
    database.setBool(queryID, true);
    emit LogETHUSDQuery(msg.sender, queryID, now);
    return true;
  }

  function priceUSDWOM()
  public
  returns (bool){
    bytes32 queryID = oraclize_query('nested', '[WolframAlpha]  10 to the power of 3 multiplied by ${[URL] json(https://api.coinmarketcap.com/v1/ticker/wom-token/).0.price_usd}');
    database.setBool(queryID, true);
    emit LogWOMUSDQuery(msg.sender, queryID, now);
    return true;
  }

  function __callback(bytes32 myid, string result)
  public
  isOraclize {
    if (database.boolStorage(myid)) {
      ethUSDCallback(myid, result);
    }
    else {
      womUSDCallback(myid, result);
    }
  }

  function ethUSDCallback(bytes32 myid, string result)
  internal {
    uint priceTimeline = database.uintStorage(keccak256("priceUpdateTimeline"));
    database.setUint(keccak256("ethUSDPrice"), parseInt(result));
    database.setUint(keccak256("ethUSDPriceExpiration"), (priceTimeline + now));
    database.deleteBool(myid);
    emit LogETHUSDCallback(myid, parseInt(result), now);
  }

  function womUSDCallback(bytes32 myid, string result)
  internal {
    uint priceTimeline = database.uintStorage(keccak256("priceUpdateTimeline"));
    database.setUint(keccak256("womUSDPrive"), parseInt(result));
    database.setUint(keccak256("womUSDPriceExpiration"), (priceTimeline + now));
    emit LogWOMUSDCallback(myid, parseInt(result), now);
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

  modifier requiresEther() {
    require(msg.value > 0);
    _;
  }

  event LogWOMUSDQuery(address indexed _from, bytes32 indexed _queryID, uint indexed _timestamp);
  event LogETHUSDQuery(address indexed _from, bytes32 indexed _queryID, uint indexed _timestamp);
  event LogETHUSDCallback(bytes32 indexed _queryID, uint indexed _tokenPrice, uint indexed _timestamp);
  event LogWOMUSDCallback(bytes32 indexed _queryID, uint indexed _result, uint indexed _timestamp);
}
