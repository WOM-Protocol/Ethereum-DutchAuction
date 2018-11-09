//! Copyright Parity Technologies, 2017.
//! Released under the Apache Licence 2.

pragma solidity 0.4.24;

/// Stripped down ERC20 standard token interface.
contract Token {
	function transfer(address _to, uint256 _value) public returns (bool success);
	function approveAndCall(address _spender, uint _amount, bytes _data) public returns (bool success);
}

// From Certifier.sol
contract Certifier {
	event Confirmed(address indexed who);
	event Revoked(address indexed who);
	function certified(address) public constant returns (bool);
	function get(address, string) public constant returns (bytes32);
	function getAddress(address, string) public constant returns (address);
	function getUint(address, string) public constant returns (uint);
}

/// Simple modified second price auction contract. Price starts high and monotonically decreases
/// until all tokens are sold at the current price with currently received funds.
/// The price curve has been chosen to resemble a logarithmic curve
/// and produce a reasonable auction timeline.
contract SecondPriceAuction {
	// Events:

	/// Someone bought in at a particular max-price.
	event Buyin(address indexed who, uint accounted, uint received, uint price);

	/// Admin injected a purchase.
	event Injected(address indexed who, uint accounted, uint received);

	/// Admin uninjected a purchase.
	event Uninjected(address indexed who);

	/// At least 5 minutes has passed since last Ticked event.
	event Ticked(uint era, uint received, uint accounted);

	/// The sale just ended with the current price.
	event Ended(uint price);

	/// Finalised the purchase for `who`, who has been given `tokens` tokens.
	event Finalised(address indexed who, uint tokens);

	/// Sale did not reach softcap.
	event SoftCapNotReached(uint indexed totalReceived, uint usdWEISoftCap, address indexed _who);

	/// Auction is over. All accounts finalised.
	event Retired();

	// Constructor:

	/// Simple constructor.
	/// Token cap should take be in whole tokens, not smallest divisible units.
	constructor(
		address _certifierContract,
		address _tokenContract,
		address _tokenVesting,
		address _treasury,
		address _admin,
		uint _beginTime,
		uint _tokenCap
	)
		public
	{
		certifier = Certifier(_certifierContract);
		tokenContract = Token(_tokenContract);
		tokenVesting = _tokenVesting;
		treasury = _treasury;
		admin = _admin;
		beginTime = _beginTime;
		tokenCap = _tokenCap;
		endTime = beginTime + 15 days;
	}

	// Public interaction:

	/// Buyin function. Throws if the sale is not active and when refund would be needed.
	function buyin(uint8 v, bytes32 r, bytes32 s)
		public
		payable
		when_not_halted
		not_pre_sale_member(msg.sender)
		when_active
		only_eligible(msg.sender, v, r, s)
	{

		if (currentBonus > 0 && currentBonusRound <= 4) {
			// Bonus is currently active...
			if (now >= beginTime + BONUS_MAX_DURATION) {
				currentBonus = 0;
				currentBonusRound++;
			}
			else if (now >= beginTime + (BONUS_MAX_DURATION_ROUND*currentBonusRound)) {
				currentBonus -= 5;
				currentBonusRound++;
			}
		}

		uint accounted;
		bool refund;
		uint price;
		(accounted, refund, price) = theDeal(msg.value);

		/// No refunds allowed.
		require (!refund);

		// record the acceptance.
		buyins[msg.sender].accounted += uint128(accounted);
		buyins[msg.sender].received += uint128(msg.value);
		totalAccounted += accounted;
		totalReceived += msg.value;
		emit Buyin(msg.sender, accounted, msg.value, price);
	}

	/// Like buyin except no payment required and bonus automatically given.
	function inject(address _who, uint128 _received, uint128 _appliedBonus)
		public
		only_admin
		only_basic(_who)
		before_beginning
	{
		uint128 bonus = _received * uint128(_appliedBonus) / 100;
		uint128 accounted = _received + bonus;

		buyins[_who].accounted += accounted;
		buyins[_who].received += _received;
		buyins[_who].presale = true;
		totalAccounted += accounted;
		totalReceived += _received;
		emit Injected(_who, accounted, _received);
	}

	/// Reverses a previous `inject` command.
	function uninject(address _who)
		public
		only_admin
		before_beginning
	{
		totalAccounted -= buyins[_who].accounted;
		totalReceived -= buyins[_who].received;
		delete buyins[_who];
		emit Uninjected(_who);
	}

	/// Mint tokens for a particular participant.
	function finalise(address _who)
		public
		when_not_halted
		when_ended
		when_soft_met
		only_buyins(_who)
	{

		if (endPrice == 0) {
			endPrice = (totalAccounted * DIVISOR / tokenCap);
			emit Ended(endPrice);
		}

		uint total = buyins[_who].accounted;
		uint tokens = (total / endPrice) * DIVISOR;
		totalFinalised += total;
		bool presale = buyins[_who].presale;

	 delete buyins[_who];

		if(presale){
			require (tokenContract.approveAndCall(tokenVesting, tokens, toBytes(_who)));
		}
		else{
			require (tokenContract.transfer(_who, tokens));
		}

		emit Finalised(_who, tokens);

		if (totalFinalised == totalAccounted) {
			isFinalized = true;
			emit Retired();
		}
	}

	// Return ether to participant if softcap is not met.
	function claimRefund(address _who)
		public
		when_not_halted
		when_ended
		when_soft_not_met
		only_buyins(_who)
	{
		//TODO; add check if already emitted
		emit SoftCapNotReached(totalReceived, usdWEISoftCap, _who);

		uint total = buyins[_who].received;
		totalFinalised += total;
		delete buyins[_who];
		_who.transfer(total);

		if (totalFinalised == totalReceived) {
			emit Retired();
		}
	}



	// Admin interaction:

	/// Emergency function to update usdWEI price if bull run occurs
	function setUSDWei(uint _usdWEI) public only_admin when_active { usdWEI = _usdWEI; }

	/// Emergency function to update usdWEI soft cap if bull run occurs
	function setUSDSoftCap(uint _usdWEISoftCap) public only_admin when_active { usdWEISoftCap = _usdWEISoftCap; }

	/// Emergency function to pause buy-in and finalisation.
	function setHalted(bool _halted) public only_admin { halted = _halted; }

	/// Emergency function to drain the contract of any funds.
	function drain() public only_admin { treasury.transfer(address(this).balance); }

	// Inspection:

	/**
	 * The formula for the price over time.
	 *
	 * This is a hand-crafted formula (no named to the constants) in order to
	 * provide the following requirements:
	 *
	 * - Simple reciprocal curve (of the form y = a + b / (x + c));
	 * - Would be completely unreasonable to end in the first 48 hours;
	 * - Would reach $65m effective cap in 4 weeks.
	 *
	 * The curve begins with an effective cap (EC) of over $30b, more ether
	 * than is in existance. After 48 hours, the EC reduces to approx. $1b.
	 * At just over 10 days, the EC has reduced to $200m, and half way through
	 * the 19th day it has reduced to $100m.
	 *
	 * Here's the curve: https://www.desmos.com/calculator/k6iprxzcrg?embed
	 */

	/// y = [33200 / (x + 80) - 65] / 350
	/// Where x is the number of hours passed since the beginning of the auction.
	/*
	Where x is the number of hours passed since the beginning of the auction.
		Per this formula, the token price after the first day is approximately $0.72 priced in ETH,
		after the first week is approximately $0.20 priced in ETH, etc.
	*/

	/// The current price for a single indivisible part of a token. If a buyin happens now, this is
	/// the highest price per indivisible token part that the buyer will pay. This doesn't
	/// include the discount which may be available.
	function currentPrice() public constant when_active returns (uint) {
		if(hoursPassed() == 0){
			return usdWEI;
		}
		return (usdWEI * 33200 / ( hoursPassed() + 80) - usdWEI * 65) / 350;
	}

	function hoursPassed() public constant returns (uint) {
		return (now - beginTime) / 1 hours;
	}

	/// Returns the total indivisible token parts available for purchase right now.
	function tokensAvailable() public constant when_active returns (uint tokens) {
		uint _currentCap = totalAccounted / currentPrice();
		if (_currentCap >= tokenCap) {
			return 0;
		}
		return tokenCap - _currentCap;
	}

	/// The largest purchase than can be made at present, not including any
	/// discount.
	function maxPurchase() public constant when_active returns (uint spend) {
		return tokenCap * currentPrice() - totalAccounted;
	}

	/// Get the number of `tokens` that would be given if the sender were to
	/// spend `_value` now. Also tell you what `refund` would be given, if any.
	function theDeal(uint _value)
		public
		constant
		when_active
		returns (uint accounted, bool refund, uint price)
	{
		uint _bonus = bonus(_value);

		price = currentPrice();
		accounted = _value + _bonus;

		uint available = tokensAvailable();
		uint tokens = accounted / price;
		refund = (tokens > available);
	}

	/// Any applicable bonus to `_value`.
	function bonus(uint _value)
		public
		constant
		when_active
		returns (uint extra)
	{
		return _value * uint(currentBonus) / 100;
	}

	function toBytes(address a)
		internal
		pure
		returns
		(bytes b){
		   assembly {
		        let m := mload(0x40)
		        mstore(add(m, 20), xor(0x140000000000000000000000000000000000000000, a))
		        mstore(0x40, add(m, 52))
		        b := m
		   }
		}

	function currentTime() public constant returns (uint) { return now;}

	/// True if the sale is ongoing.
	function isActive() public constant returns (bool) { return now >= beginTime && now < endTime; }

	/// True if all buyins have finalised.
	function allFinalised() public constant returns (bool) { return now >= endTime && totalAccounted == totalFinalised; }

	/// True is ether recieved greater than softcap.
	function softCapMet() public constant returns (bool) { return totalReceived >= usdWEISoftCap; }

	/// Recover address from signature
	function recoverAddr(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
			bytes memory prefix = "\x19Ethereum Signed Message:\n32";
			bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, msgHash));
			return ecrecover(prefixedHash, v, r, s);
	}

	/// Check if signature has been signed by passed in address
	function isSigned(address _addr, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (bool) {
			bytes memory prefix = "\x19Ethereum Signed Message:\n32";
			bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, msgHash));
			return ecrecover(prefixedHash, v, r, s) == _addr;
	}

	/// Returns true if the sender of this transaction is a basic account.
	function isBasicAccount(address _who) internal constant returns (bool) {
		uint senderCodeSize;
		assembly {
			senderCodeSize := extcodesize(_who)
		}
	    return senderCodeSize == 0;
	}

	// Modifiers:

	/// Ensure the sale is ongoing.
	modifier when_active { require (isActive()); _; }

	/// Ensure the sale has not begun.
	modifier before_beginning { require (now < beginTime); _; }

	/// Ensure the sale is ended.
	modifier when_ended { require (now >= endTime); _; }

	/// Ensure we're not halted.
	modifier when_not_halted { require (!halted); _; }

	/// Ensure soft cap has been met.
	modifier when_soft_met { require (softCapMet()); _; }

	/// Ensure soft cap has not been met.
	modifier when_soft_not_met { require (!softCapMet()); _; }

	/// Ensure `_who` is a participant.
	modifier only_buyins(address _who) { require (buyins[_who].accounted != 0); _; }

	/// Ensure same address for pre-sale is not used for public, to ensure clear
	/// devide of vested tokens and non-vested tokens.
	modifier not_pre_sale_member(address _who) { require (!buyins[_who].presale); _;}

	/// Ensure sender is admin.
	modifier only_admin { require (msg.sender == admin); _; }

	/// Ensure that the signature is valid, `who` is a certified, basic account,
	/// the gas price is sufficiently low and the value is sufficiently high.
	modifier only_eligible(address who, uint8 v, bytes32 r, bytes32 s) {
		require (
			recoverAddr(STATEMENT_HASH, v, r, s) == who &&
			certifier.certified(who) &&
			isBasicAccount(who) &&
			msg.value >= DUST_LIMIT
		);
		_;
	}

	function eligibleCall(address who, uint8 v, bytes32 r, bytes32 s) public view returns(bool) {
		require (recoverAddr(STATEMENT_HASH, v, r, s) == who &&
			certifier.certified(who) &&
			isBasicAccount(who)
		);
		return true;
	}

	/// Ensure sender is not a contract.
	modifier only_basic(address who) { require (isBasicAccount(who)); _; }

	// State:

	struct Account {
		uint128 accounted;	// including bonus & hit
		uint128 received;	// just the amount received, without bonus & hit
		bool presale; // if the investor was involved in presale & funds will be locked for vesting period.
	}

	/// Those who have bought in to the auction.
	mapping (address => Account) public buyins;

	/// Total amount of ether received, excluding phantom "bonus" ether.
	uint public totalReceived = 0;

	/// Total amount of ether accounted for, including phantom "bonus" ether.
	uint public totalAccounted = 0;

	/// Total amount of ether which has been finalised.
	uint public totalFinalised = 0;

	/// Current iteration of bonus round.
	uint public currentBonusRound = 1;

	/// The current end time. Gets updated when new funds are received.
	uint public endTime;

	/// The price per token; only valid once the sale has ended and at least one
	/// participant has finalised.
	uint public endPrice;

	/// Must be false for any public function to be called.
	bool public halted;

	/// The current percentage of bonus that purchasers get.
	uint8 public currentBonus = 20;

	// Constants after constructor:

	/// The tokens contract.
	Token public tokenContract;

	/// The certifier.
	Certifier public certifier;

	/// The tokens vesting contract.
	address public tokenVesting;

	/// The treasury address; where all the Ether goes.
	address public treasury;

	/// The admin address; auction can be paused or halted at any time by this.
	address public admin;

	/// The time at which the sale begins.
	uint public beginTime;

	/// Maximum amount of tokens to mint. Once totalAccounted / currentPrice is
	/// greater than this, the sale ends.
	uint public tokenCap;

	// If finalized all transfers
	bool public isFinalized;

	/// Number of Wei in one USD.
	uint public usdWEI = 4520 szabo;

	/// Soft cap 10m USD in wei.
	uint public usdWEISoftCap = 45200 ether;


	// Static constants:

	/// Anything less than this is considered dust and cannot be used to buy in.
	uint constant public DUST_LIMIT = 5 finney;

	/// The hash of the statement which must be signed in order to buyin.
	/// The meaning of this hash is:
	///
	// STATEMENT_HASH = web3.sha3("\x19Ethereum Signed Message:\n" + TLCS.length + TLCS);
	// TLCS = 'This is an example terms and conditions.';
	bytes32 constant public STATEMENT_HASH = 0x296ee19d9322038f648ced3996d1909faa1eaf9fd6d1340f49180822eb0f8776;

	/// Minimum duration after sale begins that bonus is active.
	uint constant public BONUS_MIN_DURATION = 1 hours;

	/// Minimum duration after sale begins that bonus is active.
	uint constant public BONUS_MAX_DURATION = 4 days;

	// Maximum duration of each bonus round is active
	uint constant public BONUS_MAX_DURATION_ROUND = 24 hours;

	/// Number of consecutive blocks where there must be no new interest before bonus ends.
	uint constant public BONUS_LATCH = 2;

	/// Divisor of the token.
	uint constant public DIVISOR = 1000000000000000000;
}
