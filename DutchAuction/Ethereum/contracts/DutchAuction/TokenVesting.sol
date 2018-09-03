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
      uint256 start;
      uint256 cliff;
      uint256 duration;
      uint256 monthCount;
      uint256 paymentPerMonth;
      uint256 unreleased;
      uint256 released;
      uint256 cliffReleaseAmount;
      bool cliffReleased;
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

    /*
       * @param _cliff duration in seconds of the cliff in which tokens will begin to vest
       * @param _start the time (as Unix time) at which point vesting starts
       * @param _duration duration in seconds of the period in which the tokens will vest
       * @para whether the vesting is revocable or not
       */
    function registerPresaleVest(
      address _who,
      uint256 _cliff,
      uint256 _start,
      uint256 _duration
      )
      public
      onlyOwner
      notEmptyUint(_cliff)
      notEmptyUint(_start)
      notEmptyUint(_duration)
      notEmptyAddress(_who)
      notRegistered(_who)
    returns (bool)
    {
      require(_cliff <= _duration);
      users[_who] = Account(_start, _cliff, _duration, 0, 0, 0, 0, 0, false);
      emit Registration(_who, _cliff, _duration);
      return true;
    }

    function receiveApproval(address from, uint tokens, address token, bytes data)
    notEmptyAddress(from)
    notEmptyUint(tokens)
    notEmptyAddress(token)
    notEmptyBytes(data)
    public {
      require(data.length == 20);
      require(msg.sender == tokenAddress);
      address _address = bytesToAddress(data);
      uint256 duration = users[_address].duration;
      uint256 cliffReleaseAmount = tokens.div(25);
      uint _paymentPerMonth = tokens.sub(cliffReleaseAmount).div(duration.div(4 weeks));

      users[_address].cliffReleaseAmount = cliffReleaseAmount;
      users[_address].unreleased = tokens;
      users[_address].paymentPerMonth = _paymentPerMonth;
      emit TokensRecieved(_address, tokens, now);
    }


    function release() public payable returns (uint256) {
      uint256 currentBalance = users[msg.sender].unreleased;
      uint256 start = users[msg.sender].start;
      uint256 cliff = users[msg.sender].cliff;
      uint256 duration = users[msg.sender].duration;
      uint256 paymentPerMonth = users[msg.sender].paymentPerMonth;
      uint256 timeWithCliff = now + start.add(cliff);
      uint256 monthCount = users[msg.sender].monthCount;

      if (now < start.add(cliff)) {
        return 0;
      }
      else if (now >= start.add(cliff.add(duration))) {
        users[msg.sender].released += currentBalance;
        tokenInstance.transfer(msg.sender, currentBalance);
        return currentBalance;
      }
      else if(now >= start.add(cliff)){
        if(users[msg.sender].cliffReleased){
          if(now >= timeWithCliff.add(monthCount.mul(4 weeks))){

            users[msg.sender].released += paymentPerMonth;
            users[msg.sender].monthCount += 1;
            tokenInstance.transfer(msg.sender, paymentPerMonth);
            return users[msg.sender].paymentPerMonth;
          }
        }
        else{
          users[msg.sender].cliffReleased = true;
          users[msg.sender].released += users[msg.sender].cliffReleaseAmount;
          tokenInstance.transfer(msg.sender, users[msg.sender].cliffReleaseAmount);
          return 0; // Return % of the cliff
        }
      }
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
