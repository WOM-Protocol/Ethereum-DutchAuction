---
id: DutchAuction_MultiCertifier
title: MultiCertifier
---

# MultiCertifier.sol

## contract MultiCertifier

is [Certifier](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier_Certifier.html), [Ownable](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html)

Contract to allow multiple parties to collaborate over a certification contract. Each certified account is associated with the delegate who certified it. Delegates can be added and removed only by the contract owner.Source: [DutchAuction/MultiCertifier.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/DutchAuction/MultiCertifier.sol)

## Index

* [Confirmed](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#Confirmed)
* [NewOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#NewOwner)
* [Revoked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#Revoked)
* [addDelegate](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#addDelegate)
* [certified](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#certified)
* [certify](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#certify)
* [fallback](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html)
* [getCertifier](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#getCertifier)
* [only\_certified](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#only_certified)
* [only\_certifier\_of](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#only_certifier_of)
* [only\_delegate](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#only_delegate)
* [only\_uncertified](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#only_uncertified)
* [removeDelegate](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#removeDelegate)
* [revoke](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#revoke)

## Reference

### Events

* **Confirmed**

  `event` **`Confirmed`**`(address who, address by)`

  Parameters:`who` - address`by` - address

* **NewOwner**

  `event` **`NewOwner`**`(address old, address current)`

  Parameters:`old` - address`current` - address

* **Revoked**

  `event` **`Revoked`**`(address who, address by)`

  Parameters:`who` - address`by` - address

### Modifiers

* **only\_certified**

  `modifier` **`only_certified`**`(address who)`

  Parameters:`who` - address

* **only\_certifier\_of**

  `modifier` **`only_certifier_of`**`(address who)`

  Parameters:`who` - address

* **only\_delegate**

  `modifier` **`only_delegate`**`()`

* **only\_uncertified**

  `modifier` **`only_uncertified`**`(address who)`

  Parameters:`who` - address

### Functions

* **addDelegate**

  `function` **`addDelegate`**`(address _new) public`

  Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_new` - address

* **certified**

  `function` **`certified`**`(address _who) public view returns (bool)`

  Parameters:`_who` - addressReturns:bool

* **certify**

  `function` **`certify`**`(address _who) public`

  Modifiers:[only\_delegate](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#only_delegate) [only\_uncertified](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#only_uncertified)Parameters:`_who` - address

* **fallback**

  `function () public`

* **getCertifier**

  `function` **`getCertifier`**`(address _who) public view returns (address)`

  Parameters:`_who` - addressReturns:address

* **removeDelegate**

  `function` **`removeDelegate`**`(address _old) public`

  Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_old` - address

* **revoke**

  `function` **`revoke`**`(address _who) public`

  Modifiers:[only\_certifier\_of](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#only_certifier_of) [only\_certified](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_MultiCertifier.html#only_certified)Parameters:`_who` - address

