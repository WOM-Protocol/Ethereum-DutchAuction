---
id: ERC20_ERC20Interface
title: ERC20Interface
---

# ERC20Interface.sol

## contract ERC20Interface

Source: [ERC20/ERC20Interface.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/ERC20/ERC20Interface.sol)

## Index

* [Approval](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#Approval)
* [Mint](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#Mint)
* [Transfer](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#Transfer)
* [allowance](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#allowance)
* [approve](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#approve)
* [approveAndCall](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#approveAndCall)
* [balanceOf](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#balanceOf)
* [totalSupply](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#totalSupply)
* [transfer](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#transfer)
* [transferFrom](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html#transferFrom)

## Reference

### Events

* **Approval**

  `event` **`Approval`**`(address tokenOwner, address spender, uint tokens)`

  Parameters:`tokenOwner` - address`spender` - address`tokens` - uint

* **Mint**

  `event` **`Mint`**`(address to, uint amount)`

  Parameters:`to` - address`amount` - uint

* **Transfer**

  `event` **`Transfer`**`(address from, address to, uint tokens)`

  Parameters:`from` - address`to` - address`tokens` - uint

### Functions

* **allowance**

  `abstract function` **`allowance`**`(address tokenOwner, address spender) public view returns (uint)`

  Parameters:`tokenOwner` - address`spender` - addressReturns:uint

* **approve**

  `abstract function` **`approve`**`(address spender, uint tokens) public returns (bool)`

  Parameters:`spender` - address`tokens` - uintReturns:bool

* **approveAndCall**

  `abstract function` **`approveAndCall`**`(address _spender, uint _amount, bytes _data) public returns (bool)`

  Parameters:`_spender` - address`_amount` - uint`_data` - bytesReturns:bool

* **balanceOf**

  `abstract function` **`balanceOf`**`(address tokenOwner) public view returns (uint)`

  Parameters:`tokenOwner` - addressReturns:uint

* **totalSupply**

  `abstract function` **`totalSupply`**`() public view returns (uint)`

  Returns:uint

* **transfer**

  `abstract function` **`transfer`**`(address to, uint tokens) public returns (bool)`

  Parameters:`to` - address`tokens` - uintReturns:bool

* **transferFrom**

  `abstract function` **`transferFrom`**`(address from, address to, uint tokens) public returns (bool)`

  Parameters:`from` - address`to` - address`tokens` - uintReturns:bool

