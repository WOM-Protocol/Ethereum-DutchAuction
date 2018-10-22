pragma solidity 0.4.24;

import '../Libraries/SafeMath.sol';
import '../Libraries/Ownable.sol';

/// Stripped down ERC20 standard token interface.
contract Token {
	function transferFrom(address _from, address _to, uint _amount) public returns (bool success);
	function approveAndCall(address _spender, uint _amount, bytes _data) public returns (bool success);
  function allowance(address _tokenHolder, address _spender) public view returns (uint remaining);
}

contract ApproveAndCallFallBack {
  function receiveApproval(address from, uint tokens, address token, bytes data) public;
}

contract TokenVestingNew is Ownable {
    using SafeMath for *;
    address public tokenAddress;
		address public auctionAddress;
    Token public tokenContract;
		uint256 public monthEpoch = 2629743;
    bool public locked;

    mapping (address => bool) public registered;
    mapping (address => uint8) public cliffReleasePercentage;
    mapping (address => Constant) public userConstant;
    mapping (address => Altering) public userAltering;

    struct Altering {
      bool cliffReleased;
      uint8 monthCount;
      uint256 released;
    }

		struct Constant {
      uint64 duration;
			uint128 cliffReleaseEpoch;
      uint256 cliffReleaseAmount;
      uint256 total;
		}

    constructor(address _tokenWOM)
    public
    not_empty_address(_tokenWOM)
    {
      tokenAddress = _tokenWOM;
      tokenContract = Token(_tokenWOM);
    }

    function registerPresaleVest(
      address _who,
      uint128 _cliffReleaseEpoch,
      uint64 _duration,
			uint8 _cliffReleasePercentage)
      public
      not_locked
      only_owner
      not_empty_uint(_cliffReleaseEpoch)
      not_empty_uint(_duration)
			not_empty_uint(_cliffReleasePercentage)
      not_empty_address(_who)
      not_registered(_who)
    returns (bool)
    {
      registered[_who] = true;
      require(_duration % monthEpoch == 0);
      userConstant[_who].duration = _duration;
      userConstant[_who].cliffReleaseEpoch = _cliffReleaseEpoch;
			cliffReleasePercentage[_who] = _cliffReleasePercentage;
      emit Registration(_who, _cliffReleaseEpoch, _duration);
      return true;
    }

    function receiveApproval(address from, uint tokens, address token, bytes data)
    public {
      require(data.length == 20);
      require(msg.sender == tokenAddress);
			require(from == auctionAddress);
			require(token == tokenAddress);
      address _who = bytesToAddress(data);
      require(registered[_who]);
      userConstant[_who].total = tokens;
      userConstant[_who].cliffReleaseAmount = tokens.mul(cliffReleasePercentage[_who]).div(100);
      delete cliffReleasePercentage[_who];
      emit TokensRecieved(_who, tokens, now);
    }

    function release()
    public
    not_locked
    is_registered(msg.sender)
    returns (bool)
    {
      /*
        1 - greater than _duration, release all
        2 - release cliff
        3 -
      */
      uint128 _cliffReleaseEpoch = userConstant[msg.sender].cliffReleaseEpoch;
      require(now >= _cliffReleaseEpoch); // Greater than cliff
      uint64 _duration = userConstant[msg.sender].duration;
      uint256 _releaseAmount;
      if(now >= _cliffReleaseEpoch.add(_duration)){
        _releaseAmount = userConstant[msg.sender].total - userAltering[msg.sender].released;
        delete userAltering[msg.sender];
        delete userConstant[msg.sender];
        tokenContract.transferFrom(auctionAddress, msg.sender, _releaseAmount);
        return true;
      }
      if(userAltering[msg.sender].cliffReleased){
        require(monthsPassed(msg.sender) != 0);
        if(monthsPassed(msg.sender) == userAltering[msg.sender].monthCount){
          return true;
        }
        else{
          uint8 _monthsNew = monthsPassed(msg.sender) - userAltering[msg.sender].monthCount;
          _releaseAmount += getMonthReleaseValue(msg.sender).mul(_monthsNew);
          userAltering[msg.sender].released = _releaseAmount;
          userAltering[msg.sender].monthCount += _monthsNew;
          tokenContract.transferFrom(auctionAddress, msg.sender, _releaseAmount);
        }
      }
      // months and cliff value if cliff not released
      else{
        _releaseAmount = userConstant[msg.sender].cliffReleaseAmount;
        uint8 _monthCount = monthsPassed(msg.sender);

        if(_monthCount > 0){
          userAltering[msg.sender].monthCount = _monthCount;
          _releaseAmount += getMonthReleaseValue(msg.sender).mul(_monthCount);
        }

        userAltering[msg.sender].cliffReleased = true;
        userAltering[msg.sender].released += _releaseAmount;
        tokenContract.transferFrom(auctionAddress, msg.sender, _releaseAmount);
        return true;
      }
    }

    function monthsPassed(address _who)
    public
    view
    returns (uint8){
      return uint8((now - userConstant[_who].duration) / monthEpoch);
    }

    function getMonthReleaseValue(address _who)
    public
    view
    returns (uint256){
      return (userConstant[_who].total - userConstant[_who].cliffReleaseAmount) / (userConstant[_who].duration / monthEpoch);
    }


    /* Admin functionality */
    function assignAuctionAddress(address _auctionAddress) public only_owner returns(bool){
      require(auctionAddress == address(0));
      auctionAddress = _auctionAddress;
      return true;
    }

    function setLock(bool _lock) public only_owner returns(bool){
      locked = _lock;
      return true;
    }

    function emergencyDrain(address _emergencyAddress) public only_owner is_locked returns(bool){
      uint256 balanceOf = tokenContract.allowance(auctionAddress, this);
      tokenContract.transferFrom(auctionAddress, _emergencyAddress, balanceOf);
      return true;
    }

	/*	function fullDurationMet() public view returns(bool){
			return now > users[msg.sender].start + users[msg.sender].duration;
		}
*/
    function bytesToAddress(bytes bys)
    private
    view
    returns (address addr) {
      assembly {
        addr := mload(add(bys,20))
        }
    }



    modifier is_registered(address _who) { require (registered[_who]); _; }
    modifier not_registered(address _who) { require (!registered[_who]); _; }
    modifier not_empty_address(address _who) { require (_who != address(0)); _; }
    modifier not_empty_uint(uint _uint) { require (_uint != 0); _; }
    modifier not_locked() { require (!locked); _; }
    modifier is_locked() { require (locked); _; }

    event Registration(address indexed who, uint indexed cliffReleaseEpoch, uint indexed duration);
    event TokensRecieved(address indexed who, uint indexed amount, uint indexed timestamp);
    event Released(uint256 amount);
    event Revoked();

		/**
     * @dev Fallback function that does not accept Ether.
     */
    function ()
    public
     {
        revert();
    }
}
