/* solium-disable security/no-block-members */

pragma solidity ^0.4.24;

import '../Libraries/SafeMath.sol';
import '../Libraries/Ownable.sol';

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

  event TokensReleased(address indexed who, uint256 amount);
  event Registration(address indexed who, uint256 indexed cliff, uint256 indexed duration);
  event TokensRecieved(address indexed who, uint256 indexed amount, uint256 indexed timestamp);
	event TokenVestingRevoked(address indexed who, uint256 indexed amount);
  event Released(uint256 amount);
  event Revoked();

  // beneficiary of tokens after they are released
  address public tokenAddress;
  address public auctionAddress;
  Token public tokenContract;
  bool public locked;

	uint256 public totalAccounted;
	uint256 public totalReleased;
	bool public isFinalized;

  struct UserData {
    uint128 cliff;
    uint256 start;
    uint64 duration;
    uint256 unreleased;
    uint256 released;
    bool revocable;
  }

  mapping (address => UserData) public userData;
  mapping (address => bool) public revoked;
  mapping (address => bool) public registered;

   constructor(address _tokenWOM)
   public
   not_empty_address(_tokenWOM)
   {
     tokenAddress = _tokenWOM;
     tokenContract = Token(_tokenWOM);
   }

   function registerPresaleVest(
		 bool _revocable,
     address _who,
     uint128 _cliff,
     uint64 _duration)
     public
     not_locked
     only_owner
     not_empty_uint(_cliff)
     not_empty_uint(_duration)
     not_empty_address(_who)
     not_registered(_who)
   returns (bool)
   {
     registered[_who] = true;
		 userData[_who].revocable = _revocable;
     userData[_who].cliff = _cliff;
     userData[_who].duration = _duration;
     emit Registration(_who, _cliff, _duration);
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
		 totalAccounted = totalAccounted.add(tokens);
     userData[_who].unreleased = tokens;
     userData[_who].start = now;
     emit TokensRecieved(_who, tokens, now);
   }


	 // TODO; ensure that auction has transferred funds.
  /**
   * @notice Transfers vested tokens to beneficiary.
   */
  function release() public {
    require(registered[msg.sender]);

    uint256 _releaseAmount = _releasableAmount(msg.sender);

    require(_releaseAmount > 0);

    userData[msg.sender].released = userData[msg.sender].released.add(_releaseAmount);
    userData[msg.sender].unreleased = userData[msg.sender].unreleased.sub(_releaseAmount);

		if(_allReleased(msg.sender)){
			delete registered[msg.sender];
			delete userData[msg.sender];
		}

		totalReleased = totalReleased.add(_releaseAmount);

    tokenContract.transferFrom(auctionAddress, msg.sender, _releaseAmount);

		if(totalAccounted == totalReleased){
			isFinalized = true;
		}
    emit TokensReleased(msg.sender, _releaseAmount);
  }


	function revoke(address _who, address _emergencyAddress) public only_owner not_locked {
		require(registered[_who]);
    require(userData[_who].revocable);
    require(!revoked[_who]);

		uint256 _unreleased = userData[_who].unreleased;
		userData[_who].unreleased = 0;

		totalAccounted = totalAccounted.sub(_unreleased);

    revoked[_who] = true;

    tokenContract.transferFrom(auctionAddress, _emergencyAddress, _unreleased);

    emit TokenVestingRevoked(_who, _unreleased);
  }

  /**
   * @dev Calculates the amount that has already vested but hasn't been released yet.
   */
  function _releasableAmount(address _who) private view returns (uint256) {
    return _vestedAmount(_who).sub(userData[_who].released);
  }

	/**
	 * @dev Determines if user has released all of their funds.
	 */
	function _allReleased(address _who) private view returns(bool) {
		return (userData[_who].unreleased == 0);
	}

  /**
   * @dev Calculates the amount that has already vested.
   */
  function _vestedAmount(address _who) private view returns (uint256) {
    uint256 currentBalance = userData[_who].unreleased;
    uint256 totalBalance = currentBalance.add(userData[_who].released);

    if (now < cliff(_who)) {
      return 0;
    } else if (now >= start(_who).add(duration(_who)) || revoked[_who]) {
      return totalBalance;
    } else {
      return totalBalance.mul(now.sub(start(_who))).div(duration(_who));
      // 10,000,000 * ((1541550459 - 1573086459) /
    }
  }

  /**
   * @return the cliff time of the token vesting.
   */
  function cliff(address _who) public view returns(uint256) {
    return userData[_who].cliff;
  }

  /**
   * @return the start time of the token vesting.
   */
  function start(address _who) public view returns(uint256) {
    return userData[_who].start;
  }

  /**
   * @return the duration of the token vesting.
   */
  function duration(address _who) public view returns(uint256) {
    return userData[_who].duration;
  }

  /**
   * @return true if the vesting is revocable.
   */
  function revocable(address _who) public view returns(bool) {
    return userData[_who].revocable;
  }

  /**
   * @return the amount of tokens released.
   */
  function released(address _who) public view returns(uint256) {
    return userData[_who].released;
  }

  /**
   * @return the amount of tokens unreleased.
   */
  function unreleased(address _who) public view returns(uint256) {
    return userData[_who].unreleased;
  }

	/**
   * @return if all payments have been claimed.
   */
  function allFinalized() public view returns(bool) {
    return isFinalized;
  }

	/**
	 * @return the current timestamp.
	 */
  function timeNow() public view returns(uint256) {
    return now;
  }

	/**
	 * @return converts bytes to address.
	 */
  function bytesToAddress(bytes bys)
  private
  view
  returns (address addr) {
    assembly {
      addr := mload(add(bys,20))
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


  modifier is_registered(address _who) { require (registered[_who]); _; }
  modifier not_registered(address _who) { require (!registered[_who]); _; }
  modifier not_empty_address(address _who) { require (_who != address(0)); _; }
  modifier not_empty_uint(uint _uint) { require (_uint != 0); _; }
  modifier not_locked() { require (!locked); _; }
  modifier is_locked() { require (locked); _; }

  /**
   * @dev Fallback function that does not accept Ether.
   */
  function ()
  public
   {
      revert();
  }
}
