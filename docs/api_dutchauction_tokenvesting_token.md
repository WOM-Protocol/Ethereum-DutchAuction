---
id: DutchAuction_TokenVesting_Token
title: Token
---

# TokenVesting.sol - Token

## contract Token

Source: [DutchAuction/TokenVesting.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/DutchAuction/TokenVesting.sol)

## Index

* [allowance](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting_Token.html#allowance)
* [approveAndCall](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting_Token.html#approveAndCall)
* [transferFrom](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_TokenVesting_Token.html#transferFrom)

## Reference

### Functions

* **allowance**

  `abstract function` **`allowance`**`(address _tokenHolder, address _spender) public view returns (uint)`

  Parameters:`_tokenHolder` - address`_spender` - addressReturns:uint

* **approveAndCall**

  `abstract function` **`approveAndCall`**`(address _spender, uint _amount, bytes _data) public returns (bool)`

  Parameters:`_spender` - address`_amount` - uint`_data` - bytesReturns:bool

* **transferFrom**

  `abstract function` **`transferFrom`**`(address _from, address _to, uint _amount) public returns (bool)`

  Parameters:`_from` - address`_to` - address`_amount` - uintReturns:bool

