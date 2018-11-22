---
id: Libraries_Ownable
title: Ownable
---

# Ownable.sol

## contract Ownable

The Ownable contract has an owner address, and provides basic authorization control functions, this simplifies the implementation of "user permissions".Source: [Libraries/Ownable.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/Libraries/Ownable.sol)

## Index

* [OwnershipRenounced](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#OwnershipRenounced)
* [OwnershipTransferred](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#OwnershipTransferred)
* [\_transferOwnership](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#_transferOwnership)
* [fallback](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html)
* [onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)
* [renounceOwnership](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#renounceOwnership)
* [transferOwnership](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#transferOwnership)

## Reference

### Events

* **OwnershipRenounced**

  `event` **`OwnershipRenounced`**`(address previousOwner)`

  Parameters:`previousOwner` - address

* **OwnershipTransferred**

  `event` **`OwnershipTransferred`**`(address previousOwner, address newOwner)`

  Parameters:`previousOwner` - address`newOwner` - address

### Modifiers

* **onlyOwner**

  `modifier` **`onlyOwner`**`()`

  Throws if called by any account other than the owner.

### Functions

* **\_transferOwnership**

  `function` **`_transferOwnership`**`(address _newOwner) internal`

  Transfers control of the contract to a newOwner.Parameters:`_newOwner` - The address to transfer ownership to.

* **fallback**

  `function () public`

  The Ownable constructor sets the original \`owner\` of the contract to the sender account.

* **renounceOwnership**

  `function` **`renounceOwnership`**`() public`

  Allows the current owner to relinquish control of the contract., Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the \`onlyOwner\` modifier anymore.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)

* **transferOwnership**

  `function` **`transferOwnership`**`(address _newOwner) public`

  Allows the current owner to transfer control of the contract to a newOwner.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_newOwner` - The address to transfer ownership to.

