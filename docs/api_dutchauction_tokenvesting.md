---
id: DutchAuction_TokenVesting
title: TokenVesting
---

# TokenVesting.sol

## contract TokenVesting

is [Ownable](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html)

This contract manages pre-sale tokens with particular vesting periods.Source: [DutchAuction/TokenVesting.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/DutchAuction/TokenVesting.sol)Author: Connor Howe - ConnorBlockchain

## Index

* [AuctionAddressAssigned](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#AuctionAddressAssigned)
* [EmergencyDrain](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#EmergencyDrain)
* [LockUpdated](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#LockUpdated)
* [Registration](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#Registration)
* [Released](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#Released)
* [Revoked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#Revoked)
* [TokenVestingRevoked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#TokenVestingRevoked)
* [TokensRecieved](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#TokensRecieved)
* [TokensReleased](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#TokensReleased)
* [emergencyDrain](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#emergencyDrain)
* [fallback](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html)
* [getCliff](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#getCliff)
* [getDuration](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#getDuration)
* [getFinalized](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#getFinalized)
* [getReleased](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#getReleased)
* [getRevocable](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#getRevocable)
* [getStart](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#getStart)
* [getUnreleased](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#getUnreleased)
* [notEmptyAddress](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notEmptyAddress)
* [notEmptyUint](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notEmptyUint)
* [notLocked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notLocked)
* [notRegistered](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notRegistered)
* [receiveApproval](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#receiveApproval)
* [registerPresaleVest](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#registerPresaleVest)
* [release](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#release)
* [revoke](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#revoke)
* [setAuctionAddress](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#setAuctionAddress)
* [setLock](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#setLock)

## Reference

### Events

* **AuctionAddressAssigned**

  `event` **`AuctionAddressAssigned`**`(address auctionAddress)`

  Parameters:`auctionAddress` - address

* **EmergencyDrain**

  `event` **`EmergencyDrain`**`(address emergencyAddress, uint amount)`

  Parameters:`emergencyAddress` - address`amount` - uint

* **LockUpdated**

  `event` **`LockUpdated`**`(bool lockActive)`

  Parameters:`lockActive` - bool

* **Registration**

  `event` **`Registration`**`(address who, uint256 cliff, uint256 duration)`

  Parameters:`who` - address`cliff` - uint256`duration` - uint256

* **Released**

  `event` **`Released`**`(uint256 amount)`

  Parameters:`amount` - uint256

* **Revoked**

  `event` **`Revoked`**`()`

* **TokenVestingRevoked**

  `event` **`TokenVestingRevoked`**`(address who, uint256 amount)`

  Parameters:`who` - address`amount` - uint256

* **TokensRecieved**

  `event` **`TokensRecieved`**`(address who, uint256 amount, uint256 timestamp)`

  Parameters:`who` - address`amount` - uint256`timestamp` - uint256

* **TokensReleased**

  `event` **`TokensReleased`**`(address who, uint256 amount)`

  Parameters:`who` - address`amount` - uint256

### Modifiers

* **notEmptyAddress**

  `modifier` **`notEmptyAddress`**`(address _who)`

  Parameters:`_who` - address

* **notEmptyUint**

  `modifier` **`notEmptyUint`**`(uint _uint)`

  Parameters:`_uint` - uint

* **notLocked**

  `modifier` **`notLocked`**`()`

* **notRegistered**

  `modifier` **`notRegistered`**`(address _who)`

  Parameters:`_who` - address

### Functions

* **emergencyDrain**

  `function` **`emergencyDrain`**`(address _emergencyAddress) public`

  Owner can drain all remaining unreleased pre-sale tokens incase a vulnerability is found.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_emergencyAddress` - Address where total unrealeased tokens will be transferred too.

* **fallback**

  `function (address _tokenWOM) public`

  Initializes instance of Token Contract and assigns address.Modifiers:[notEmptyAddress](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notEmptyAddress)Parameters:`_tokenWOM` - Address of ERC20 token contract for WOM.

* **getCliff**

  `function` **`getCliff`**`(address _who) public view returns (uint256)`

  Parameters:`_who` - addressReturns:Epoch seconds of users Cliff.

* **getDuration**

  `function` **`getDuration`**`(address _who) public view returns (uint256)`

  Parameters:`_who` - addressReturns:The duration of the token vesting.

* **getFinalized**

  `function` **`getFinalized`**`() public view returns (bool)`

  Returns:If all pre-sale tokens have been released/claimed..

* **getReleased**

  `function` **`getReleased`**`(address _who) public view returns (uint256)`

  Parameters:`_who` - addressReturns:The amount of tokens released.

* **getRevocable**

  `function` **`getRevocable`**`(address _who) public view returns (bool)`

  Parameters:`_who` - addressReturns:True if the vesting is revocable.

* **getStart**

  `function` **`getStart`**`(address _who) public view returns (uint256)`

  Parameters:`_who` - addressReturns:The start time of token vesting.

* **getUnreleased**

  `function` **`getUnreleased`**`(address _who) public view returns (uint256)`

  Parameters:`_who` - addressReturns:The amount of tokens unreleased.

* **receiveApproval**

  `function` **`receiveApproval`**`(address from, uint tokens, address token, bytes data) public`

  Called once SecondPriceAuction finalise\(\) called, and then the ERC20 calls this function.Parameters:`from` - SecondPriceAuction address.`tokens` - Amount of tokens that has been approved.`token` - Address of ERC20 token.`data` - Bytes conversion of pre-sale members address.

* **registerPresaleVest**

  `function` **`registerPresaleVest`**`(bool _revocable, address _who, uint128 _cliff, uint64 _duration) public`

  Owner registers pre-sale amount and agreed vesting terms.Modifiers:[notLocked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notLocked) [onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner) [notEmptyUint](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notEmptyUint) [notEmptyUint](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notEmptyUint) [notEmptyAddress](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notEmptyAddress) [notRegistered](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notRegistered)Parameters:`_revocable` - Whether owner can revoke unreleased tokens if a breach in vesting contract.`_who` - The persons address.`_cliff` - Epoch seconds for cliff time.`_duration` - Epoch seconds for duration of vest.

* **release**

  `function` **`release`**`() public`

  Pre-sale members release their locked up funds.

* **revoke**

  `function` **`revoke`**`(address _who, address _emergencyAddress) public`

  Owner revokes users remaining unreleased funds, and transfers to an emergency address.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner) [notLocked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting.html#notLocked)Parameters:`_who` - Pre-sale members address to revoke future releases.`_emergencyAddress` - Address remainder of pre-sale users unreleased tokens will be transfered to.

* **setAuctionAddress**

  `function` **`setAuctionAddress`**`(address _auctionAddress) public`

  Owner assigns SecondPriceAuction address for lookups and transfers.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_auctionAddress` - SecondPriceAuction address.

* **setLock**

  `function` **`setLock`**`(bool _lock) public`

  Owner can lock the contract incase a vulnerability is found.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_lock` - Bool assign lock.

