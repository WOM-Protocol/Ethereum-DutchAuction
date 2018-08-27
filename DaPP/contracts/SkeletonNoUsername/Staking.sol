pragma solidity ^0.4.24;

// ---------------- Contracts ------------- //
import './Database.sol';
import '../ERC20/ERC20BurnableAndMintable.sol';

// ---------------- Libraries ------------- //
import '../Libraries/SafeMath.sol';


contract Staking {
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
}
