---
id: DutchAuction_SecondPriceAuction
title: SecondPriceAuction
---

# SecondPriceAuction.sol

## contract SecondPriceAuction

Simple modified second price auction contract. Price starts high and monotonically decreases until all tokens are sold at the current price with currently received funds. The price curve has been chosen to resemble a logarithmic curve and produce a reasonable auction timeline. Requires softcap to be met, before finalisation, and if finalisation is not met a refund will be available.Source: [DutchAuction/SecondPriceAuction.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/DutchAuction/SecondPriceAuction.sol)Author: Parity Technologies, 2017. Modifications made by Connor Howe - ConnorBlockchain.

## Index

* [Buyin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#Buyin)
* [Ended](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#Ended)
* [Finalised](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#Finalised)
* [Injected](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#Injected)
* [Retired](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#Retired)
* [SoftCapNotReached](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#SoftCapNotReached)
* [Uninjected](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#Uninjected)
* [allFinalised](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#allFinalised)
* [beforeBeginning](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#beforeBeginning)
* [bonus](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#bonus)
* [buyin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#buyin)
* [claimRefund](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#claimRefund)
* [currentPrice](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#currentPrice)
* [currentTime](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#currentTime)
* [drain](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#drain)
* [eligibleCall](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#eligibleCall)
* [fallback](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html)
* [finalise](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#finalise)
* [hoursPassed](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#hoursPassed)
* [inject](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#inject)
* [isActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#isActive)
* [isSigned](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#isSigned)
* [maxPurchase](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#maxPurchase)
* [notPreSaleMember](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#notPreSaleMember)
* [onlyAdmin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyAdmin)
* [onlyBasic](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyBasic)
* [onlyBuyins](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyBuyins)
* [onlyEligible](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyEligible)
* [recoverAddr](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#recoverAddr)
* [setHalted](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#setHalted)
* [setUSDSoftCap](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#setUSDSoftCap)
* [setUSDWei](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#setUSDWei)
* [softCapMet](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#softCapMet)
* [theDeal](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#theDeal)
* [tokensAvailable](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#tokensAvailable)
* [uninject](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#uninject)
* [whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive)
* [whenEnded](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenEnded)
* [whenNotHalted](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenNotHalted)
* [whenSoftMet](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenSoftMet)
* [whenSoftNotMet](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenSoftNotMet)

## Reference

### Events

* **Buyin**

  `event` **`Buyin`**`(address who, uint accounted, uint received, uint price)`

  Someone bought in at a particular max-price.Parameters:`who` - address`accounted` - uint`received` - uint`price` - uint

* **Ended**

  `event` **`Ended`**`(uint price)`

  The sale just ended with the current price.Parameters:`price` - uint

* **Finalised**

  `event` **`Finalised`**`(address who, uint tokens)`

  Finalised the purchase for \`who\`, who has been given \`tokens\` tokens.Parameters:`who` - address`tokens` - uint

* **Injected**

  `event` **`Injected`**`(address who, uint accounted, uint received)`

  Admin injected a purchase.Parameters:`who` - address`accounted` - uint`received` - uint

* **Retired**

  `event` **`Retired`**`()`

  Auction is over. All accounts finalised.

* **SoftCapNotReached**

  `event` **`SoftCapNotReached`**`(uint totalReceived, uint usdWEISoftCap, address _who)`

  Sale did not reach softcap.Parameters:`totalReceived` - uint`usdWEISoftCap` - uint`_who` - address

* **Uninjected**

  `event` **`Uninjected`**`(address who)`

  Admin uninjected a purchase.Parameters:`who` - address

### Modifiers

* **beforeBeginning**

  `modifier` **`beforeBeginning`**`()`

  Ensure the sale has not begun.

* **notPreSaleMember**

  `modifier` **`notPreSaleMember`**`(address _who)`

  Ensure same address for pre-sale is not used for public, to ensure clear devide of vested tokens and non-vested tokens.Parameters:`_who` - address

* **onlyAdmin**

  `modifier` **`onlyAdmin`**`()`

  Ensure sender is admin.

* **onlyBasic**

  `modifier` **`onlyBasic`**`(address who)`

  Ensure sender is not a contract.Parameters:`who` - address

* **onlyBuyins**

  `modifier` **`onlyBuyins`**`(address _who)`

  Ensure \`\_who\` is a participant.Parameters:`_who` - address

* **onlyEligible**

  `modifier` **`onlyEligible`**`(address who, uint8 v, bytes32 r, bytes32 s)`

  Ensure that the signature is valid, \`who\` is a certified, basic account, the gas price is sufficiently low and the value is sufficiently high.Parameters:`who` - address`v` - uint8`r` - bytes32`s` - bytes32

* **whenActive**

  `modifier` **`whenActive`**`()`

  Ensure the sale is ongoing.

* **whenEnded**

  `modifier` **`whenEnded`**`()`

  Ensure the sale is ended.

* **whenNotHalted**

  `modifier` **`whenNotHalted`**`()`

  Ensure we're not halted.

* **whenSoftMet**

  `modifier` **`whenSoftMet`**`()`

  Ensure soft cap has been met.

* **whenSoftNotMet**

  `modifier` **`whenSoftNotMet`**`()`

  Ensure soft cap has not been met.

### Functions

* **allFinalised**

  `function` **`allFinalised`**`() public view returns (bool)`

  Returns:True if all buyins have finalised.

* **bonus**

  `function` **`bonus`**`(uint _value) public view returns (uint)`

  If bonus is still occuring, and if so what would the token amount be once bonus applied.Modifiers:[whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive)Parameters:`_value` - Ether amount of potential purchase.Returns:Amount of tokens + bonus.

* **buyin**

  `function` **`buyin`**`(uint8 v, bytes32 r, bytes32 s) public payable`

  User buys in to auction, and throws if not active and when refund needed.Modifiers:[whenNotHalted](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenNotHalted) [notPreSaleMember](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#notPreSaleMember) [whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive) [onlyEligible](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyEligible)Parameters:`v` - uint8`r` - bytes32`s` - bytes32

* **claimRefund**

  `function` **`claimRefund`**`(address _who) public`

  Returns ether to participant if softcap is not met.Modifiers:[whenNotHalted](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenNotHalted) [whenEnded](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenEnded) [whenSoftNotMet](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenSoftNotMet) [onlyBuyins](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyBuyins)Parameters:`_who` - Address of pre-sale member to refund tokens to.

* **currentPrice**

  `function` **`currentPrice`**`() public view returns (uint)`

  Modifiers:[whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive)Returns:The current price of 1 token in usdWEI.

* **currentTime**

  `function` **`currentTime`**`() public view returns (uint)`

  Returns:The current time.

* **drain**

  `function` **`drain`**`() public`

  Admin emergency function to drain the contract of any funds.Modifiers:[onlyAdmin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyAdmin)

* **eligibleCall**

  `function` **`eligibleCall`**`(address who, uint8 v, bytes32 r, bytes32 s) public view returns (bool)`

  Check if who address can purchase via buyin function.Parameters:`who` - Address to check if signature has been signed b and KYC has passed.`v` - uint8`r` - bytes32`s` - bytes32Returns:bool

* **fallback**

  `function (address _certifierContract, address _tokenContract, address _tokenVesting, address _treasury, address _admin, uint _beginTime, uint _tokenCap) public`

  Initializes instance of Token & Certifier contract, and assigns all values.Parameters:`_certifierContract` - Address of Certifier contract.`_tokenContract` - Address of ERC20 contract.`_tokenVesting` - Address of TokenVesting contract.`_treasury` - Address of treasury.`_admin` - Address of admin.`_beginTime` - Start time of dutch auction.`_tokenCap` - Token cap in whole tokens \(decimals\).

* **finalise**

  `function` **`finalise`**`(address _who) public`

  Calculates final token price, and transfers tokens to \_who when softcap and time met. If presale member, approveAndCall will auto call TokenVesting contract.Modifiers:[whenNotHalted](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenNotHalted) [whenEnded](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenEnded) [whenSoftMet](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenSoftMet) [onlyBuyins](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyBuyins)Parameters:`_who` - Address of pre-sale member to transfer tokens

* **hoursPassed**

  `function` **`hoursPassed`**`() public view returns (uint)`

  Returns:Amount of hours that the auction has passed.

* **inject**

  `function` **`inject`**`(address _who, uint128 _received, uint128 _appliedBonus) public`

  Similar to buyin except no payment reqired and bonus automatically given, only callable by admin.Modifiers:[onlyAdmin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyAdmin) [onlyBasic](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyBasic) [beforeBeginning](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#beforeBeginning)Parameters:`_who` - Address of pre-sale member.`_received` - Amount of ether that the pre-sale member contributed.`_appliedBonus` - Bonus agreed in pre-sale agreement.

* **isActive**

  `function` **`isActive`**`() public view returns (bool)`

  Returns:True if the sale is ongoing.

* **isSigned**

  `function` **`isSigned`**`(address _addr, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (bool)`

  Check if signature has been signed by \_addr.Parameters:`_addr` - Address to check if signature has been signed by.`msgHash` - Hash of terms and conditions.`v` - uint8`r` - bytes32`s` - bytes32Returns:bool

* **maxPurchase**

  `function` **`maxPurchase`**`() public view returns (uint)`

  Modifiers:[whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive)Returns:The largest purchase that can be made at present, not including any discount.

* **recoverAddr**

  `function` **`recoverAddr`**`(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address)`

  Recover address from msg signature.Parameters:`msgHash` - Hash of terms and conditions.`v` - uint8`r` - bytes32`s` - bytes32Returns:address

* **setHalted**

  `function` **`setHalted`**`(bool _halted) public`

  Admin emergency function to pause buy-in and finalisation.Modifiers:[onlyAdmin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyAdmin)Parameters:`_halted` - Bool to transition contract to halted state or not.

* **setUSDSoftCap**

  `function` **`setUSDSoftCap`**`(uint _usdWEISoftCap) public`

  Admin can change softcap USDWEI value of 10m if bull run occurs.Modifiers:[onlyAdmin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyAdmin) [whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive)Parameters:`_usdWEISoftCap` - Amount of WEI to 10m USD.

* **setUSDWei**

  `function` **`setUSDWei`**`(uint _usdWEI) public`

  Admin can change stored USDWEI value of ether if bull run occurs.Modifiers:[onlyAdmin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyAdmin) [whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive)Parameters:`_usdWEI` - Amount of WEI to 1 USD.

* **softCapMet**

  `function` **`softCapMet`**`() public view returns (bool)`

  Returns:True if ether recieved greater than softcap.

* **theDeal**

  `function` **`theDeal`**`(uint _value) public view returns (uint, bool, uint)`

  Amount of tokens that would be given to the sender if they were to spent \_value now.Modifiers:[whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive)Parameters:`_value` - Ether amount of potential purchase.Returns:Amount of tokens.

* **tokensAvailable**

  `function` **`tokensAvailable`**`() public view returns (uint)`

  Modifiers:[whenActive](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#whenActive)Returns:Total indivisible token parts available for purchase right now.

* **uninject**

  `function` **`uninject`**`(address _who) public`

  Reverses previous injection function, only callable by admin.Modifiers:[onlyAdmin](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#onlyAdmin) [beforeBeginning](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction.html#beforeBeginning)Parameters:`_who` - Address of pre-sale member to reverse injection.

