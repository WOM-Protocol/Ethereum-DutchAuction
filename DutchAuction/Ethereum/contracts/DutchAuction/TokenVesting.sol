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

contract TokenVesting is Ownable {
    using SafeMath for *;

    mapping (address => Account) public users;

    address public tokenAddress;
		address public auctionAddress;

    Token public tokenContract;

		uint256 public monthEpoch = 2629743;
    bool public locked;

    struct Account {
      uint256 start;										// 0
      uint256 duration;									// 1
			uint256 cliffReleasePercentage;		// 2
			uint256 cliffReleaseAmount;				// 3
      uint256 paymentPerMonth;					// 4
      uint256 unreleased;								// 5
      uint256 released;									// 6
      uint256 total;										// 7
			uint256 monthCount;								// 8
      bool cliffReleased;								// 9
    }

    // Validate that this is the true token contract
    constructor(address _tokenWOM)
    public
    not_empty_address(_tokenWOM)
    {
      tokenAddress = _tokenWOM;
      tokenContract = Token(_tokenWOM);
    }

    function registerPresaleVest(
      address _who,
      uint256 _start,
      uint256 _duration,
			uint256 _cliffReleasePercentage
      )
      public
      not_locked
      only_owner
      not_empty_uint(_start)
      not_empty_uint(_duration)
			not_empty_uint(_cliffReleasePercentage)
      not_empty_address(_who)
      not_registered(_who)
    returns (bool)
    {
      users[_who].start = _start;
      users[_who].duration = _duration;
			users[_who].cliffReleasePercentage = _cliffReleasePercentage;
      emit Registration(_who, _start, _duration);
      return true;
    }

		/*function returnsCliffReleaseAmount(address _user, uint256 _amount) public view returns(uint256){
			return	_amount * users[_user].cliffReleasePercentage / 100;
		}

		function returnPaymentPerMonth(address _user, uint256 _amount, uint256 _duration, uint256 _epoch) public view returns(uint256){
			return _amount.sub(returnsCliffReleaseAmount(_user, _amount)).div(_duration.div(_epoch));
		}*/

    function receiveApproval(address from, uint tokens, address token, bytes data)
    public {
			//check that it is registerd address???
      require(data.length == 20);
      require(msg.sender == tokenAddress);
			require(from == auctionAddress);
			require(token == tokenAddress);
      address _address = bytesToAddress(data);
      uint256 duration = users[_address].duration;
			uint256 cliffReleaseAmount = tokens * users[_address].cliffReleasePercentage / 100;
      uint256 _paymentPerMonth = tokens.sub(cliffReleaseAmount).div(duration.div(monthEpoch));

      users[_address].cliffReleaseAmount = cliffReleaseAmount;
			users[_address].paymentPerMonth = _paymentPerMonth;
      users[_address].unreleased = tokens;
      users[_address].total = tokens;
      emit TokensRecieved(_address, tokens, now);
    }

    // TODO; ensure value is less than given amount
    function release()
    not_locked
    is_registered(msg.sender)
    public
    payable
    returns (bool) {
			uint256 currentBalance = users[msg.sender].unreleased;
      uint256 start = users[msg.sender].start;
      uint256 duration = users[msg.sender].duration;
      uint256 paymentPerMonth = users[msg.sender].paymentPerMonth;
      uint256 monthCount = users[msg.sender].monthCount;

			require(now >= start);
      if (now >= start.add(duration)) {
        users[msg.sender].released += currentBalance;
				users[msg.sender].unreleased = 0;
        tokenContract.transferFrom(auctionAddress, msg.sender, currentBalance);
        delete users[msg.sender];
        return true;
      }
      if(users[msg.sender].cliffReleased){
				// What if they haven't checked each month for their release?
        require(now >= start.add(monthCount.mul(monthEpoch)));
        users[msg.sender].released += paymentPerMonth;
				users[msg.sender].unreleased -= paymentPerMonth;
        users[msg.sender].monthCount += 1;
        tokenContract.transferFrom(auctionAddress, msg.sender, paymentPerMonth);
        return true;
      }
      else{
				uint releaseAmount = users[msg.sender].cliffReleaseAmount;
        users[msg.sender].released += releaseAmount;
				users[msg.sender].unreleased -= releaseAmount;
        users[msg.sender].cliffReleased = true;
				users[msg.sender].monthCount = 1;
        tokenContract.transferFrom(auctionAddress, msg.sender, releaseAmount);
        return true;
      }
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

		function fullDurationMet() public view returns(bool){
			return now > users[msg.sender].start + users[msg.sender].duration;
		}

    function bytesToAddress(bytes bys)
    private
    view
    returns (address addr) {
      assembly {
        addr := mload(add(bys,20))
        }
    }

    modifier is_registered(address _who) { require (users[_who].start != 0); _; }
    modifier not_registered(address _who) { require (users[_who].start == 0); _; }
    modifier not_empty_address(address _who) { require (_who != address(0)); _; }
    modifier not_empty_uint(uint _uint) { require (_uint != 0); _; }
    modifier not_locked() { require (!locked); _; }
    modifier is_locked() { require (locked); _; }

    event Registration(address indexed who, uint indexed cliff, uint indexed duration);
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
