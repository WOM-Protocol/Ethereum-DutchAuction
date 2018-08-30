pragma solidity 0.4.24;

import '../Libraries/SafeMath.sol';
import '../Libraries/Ownable.sol';
import '../ERC20/ERC20BurnableAndMintable.sol';
import './SecondPriceAuction.sol';

contract TokenVesting is Ownable{
    using SafeMath for *;

    mapping (address => Account) public users;

    address public tokenAddress;
    address public auctionAddress;

    ERC20BurnableAndMintable public tokenInstance;
    SecondPriceAuction public auctionInstance;


    struct Account {
      uint256 cliff;
      uint256 start;
      uint256 duration;
      uint256 unreleased;
      uint256 released;
      bool revoked;
    }

    // Validate that this is the true token contract
    constructor(address _tokenWOM, address _auctionAddress)
    public
    notEmptyAddress(_tokenWOM)
    notEmptyAddress(_auctionAddress)
    {
      tokenAddress = _tokenWOM;
      auctionAddress = _auctionAddress;
      tokenInstance = ERC20BurnableAndMintable(_tokenWOM);
      auctionInstance = SecondPriceAuction(_auctionAddress);
    }

    function registerPresaleVest(
      address _who,
      uint256 _cliff,
      uint256 _start,
      uint256 _duration)
      public
      onlyOwner
      notEmptyUint(_cliff)
      notEmptyUint(_start)
      notEmptyUint(_duration)
      notEmptyAddress(_who)
      notRegistered(_who)
    returns (bool)
    {
      users[_who] = Account(_cliff, _start, _duration, 0, 0, false);
      emit Registration(_who, _cliff, _duration);
      return true;
    }

    function receiveApproval(address from, uint tokens, address token, bytes data)
    notEmptyAddress(from)
    notEmptyUint(tokens)
    notEmptyAddress(token)
    notEmptyBytes(data)
    public {
      require(data.length == 20);   // address
      require(msg.sender == tokenAddress);

      address _address = bytesToAddress(data);
      users[_address].unreleased = tokens;
      emit TokensRecieved(_address, tokens, now);
    }

    function bytesToAddress(bytes bys)
    private
    pure
    returns (address addr) {
      assembly {
        addr := mload(add(bys,20))
        }
    }

    modifier notRegistered(address _who) { require (users[_who].start == 0); _; }
    modifier notEmptyAddress(address _who) { require (_who != address(0)); _; }
    modifier notEmptyUint(uint _uint) { require (_uint != 0); _; }
    modifier notEmptyBytes(bytes _data) { require(_data.length != 0); _; }

    event Registration(address indexed who, uint indexed cliff, uint indexed duration);
    event TokensRecieved(address indexed who, uint indexed amount, uint indexed timestamp);
    event Released(uint256 amount);
    event Revoked();

}
