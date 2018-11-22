---
id: ERC20_ERC20BurnableAndMintable
title: ERC20BurnableAndMintable
---

# ERC20BurnableAndMintable.sol

## contract ERC20BurnableAndMintable

is [ERC20Interface](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20Interface.html)

Standard ERC20 token contract, with non-fixed supply with burnable and mintable capabilities.Source: [ERC20/ERC20BurnableAndMintable.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/ERC20/ERC20BurnableAndMintable.sol)Author: Connor Howe - ConnorBlockchain

## Index

* [LogBurn](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#LogBurn)
* [allowance](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#allowance)
* [approve](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#approve)
* [approveAndCall](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#approveAndCall)
* [balanceOf](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#balanceOf)
* [burn](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#burn)
* [burnFrom](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#burnFrom)
* [fallback](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html)
* [mint](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#mint)
* [totalSupply](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#totalSupply)
* [transfer](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#transfer)
* [transferFrom](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/ERC20_ERC20BurnableAndMintable.html#transferFrom)

## Reference

### Events

* **LogBurn**

  `event` **`LogBurn`**`(address _burner, uint _amountBurned)`

  Parameters:`_burner` - address`_amountBurned` - uint

### Functions

* **allowance**

  `function` **`allowance`**`(address _tokenHolder, address _spender) public view returns (uint)`

  Parameters:`_tokenHolder` - address`_spender` - addressReturns:The amount of tokens allowed to be spent by \_spender from \_tokenHolder.

* **approve**

  `function` **`approve`**`(address _spender, uint _amount) public returns (bool)`

  Msg.sender can approve another address to transferFrom\(...\) tokens from msg.senders address.Parameters:`_spender` - Approved address that can transferFrom\(...\) tokens.`_amount` - Amount that \_spender can use.Returns:bool

* **approveAndCall**

  `function` **`approveAndCall`**`(address _spender, uint _amount, bytes _data) public returns (bool)`

  Msg.sender can ping a contract that the contract has been approved to spend tokens on msg.senders behalf.Parameters:`_spender` - Contract address that can spend tokens.`_amount` - Amount of tokens that the contract can spend.`_data` - Arbitrary bytes value passed to contract.Returns:bool

* **balanceOf**

  `function` **`balanceOf`**`(address _tokenHolder) public view returns (uint)`

  Parameters:`_tokenHolder` - addressReturns:Token balance of token holder address.

* **burn**

  `function` **`burn`**`(uint _amount) public returns (bool)`

  Burns \_amount of tokens from total supply and msg.senders balance.Parameters:`_amount` - Amount of tokens.Returns:bool

* **burnFrom**

  `function` **`burnFrom`**`(address _from, uint _amount) public returns (bool)`

  Burns \_amount of tokens from total supply and \_from balance if msg.sender has been approved.Parameters:`_from` - Address that tokens will be burnt from if msg.sender has been approved.`_amount` - Amount of tokens that will be burnt \_from address.Returns:bool

* **fallback**

  `function (uint _initialAmount, string _tokenName, uint8 _decimalUnits, string _tokenSymbol) public`

  Assigns token values, and assign total supply to owner.Parameters:`_initialAmount` - Total supply, assign to owner of contract.`_tokenName` - Name of token.`_decimalUnits` - Decimal amount of token.`_tokenSymbol` - Symbol of token.

* **mint**

  `function` **`mint`**`(address _to, uint _amount) public returns (bool)`

  Owner introduces new tokens into supply and increases the balance of the \_to address.Parameters:`_to` - Address that new tokens will be transferred too.`_amount` - Amount of tokens that will be introduced into supply and transfered \_to.Returns:bool

* **totalSupply**

  `function` **`totalSupply`**`() public view returns (uint)`

  Returns:The amount of tokens released.

* **transfer**

  `function` **`transfer`**`(address _to, uint _amount) public returns (bool)`

  Transfers tokens from msg.sender, to the \_to address for the \_amount parameter.Parameters:`_to` - Address to transfer the tokens too.`_amount` - Amount of tokens to transfer.Returns:bool

* **transferFrom**

  `function` **`transferFrom`**`(address _from, address _to, uint _amount) public returns (bool)`

  Transfer tokens from address \_from if \_from has allowed msg.sender to transfer to \_to address, for \_amount.Parameters:`_from` - Address to remove \_amount from if msg.sender has been approved.`_to` - Address to transfer \_amount of tokens to.`_amount` - Amount of tokens to transfer.Returns:bool

