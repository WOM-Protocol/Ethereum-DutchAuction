---
id: DutchAuction_SecondPriceAuction_Certifier
title: Certifier
---

# SecondPriceAuction.sol - Certifier

## contract Certifier

Source: [DutchAuction/SecondPriceAuction.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/DutchAuction/SecondPriceAuction.sol)

## Index

* [Confirmed](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction_Certifier.html#Confirmed)
* [Revoked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction_Certifier.html#Revoked)
* [certified](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction_Certifier.html#certified)
* [get](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction_Certifier.html#get)
* [getAddress](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction_Certifier.html#getAddress)
* [getUint](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_SecondPriceAuction_Certifier.html#getUint)

## Reference

### Events

* **Confirmed**

  `event` **`Confirmed`**`(address who)`

  Parameters:`who` - address

* **Revoked**

  `event` **`Revoked`**`(address who)`

  Parameters:`who` - address

### Functions

* **certified**

  `abstract function` **`certified`**`(address ) public view returns (bool)`

  Parameters: - addressReturns:bool

* **get**

  `abstract function` **`get`**`(address , string ) public view returns (bytes32)`

  Parameters: - address - stringReturns:bytes32

* **getAddress**

  `abstract function` **`getAddress`**`(address , string ) public view returns (address)`

  Parameters: - address - stringReturns:address

* **getUint**

  `abstract function` **`getUint`**`(address , string ) public view returns (uint)`

  Parameters: - address - stringReturns:uint

