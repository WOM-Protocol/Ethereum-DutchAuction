---
id: Libraries_SafeMath
title: SafeMath
---

# SafeMath.sol

## library SafeMath

Math operations with safety checks that revert on error.Source: [Libraries/SafeMath.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/Libraries/SafeMath.sol)

## Index

* [add](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_SafeMath.html#add)
* [div](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_SafeMath.html#div)
* [mod](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_SafeMath.html#mod)
* [mul](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_SafeMath.html#mul)
* [sub](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_SafeMath.html#sub)

## Reference

### Functions

* **add**

  `function` **`add`**`(uint256 a, uint256 b) internal pure returns (uint256)`

  Adds two numbers, reverts on overflow.Parameters:`a` - uint256`b` - uint256Returns:uint256

* **div**

  `function` **`div`**`(uint256 a, uint256 b) internal pure returns (uint256)`

  Integer division of two numbers truncating the quotient, reverts on division by zero.Parameters:`a` - uint256`b` - uint256Returns:uint256

* **mod**

  `function` **`mod`**`(uint256 a, uint256 b) internal pure returns (uint256)`

  Divides two numbers and returns the remainder \(unsigned integer modulo\), reverts when dividing by zero.Parameters:`a` - uint256`b` - uint256Returns:uint256

* **mul**

  `function` **`mul`**`(uint256 a, uint256 b) internal pure returns (uint256)`

  Multiplies two numbers, reverts on overflow.Parameters:`a` - uint256`b` - uint256Returns:uint256

* **sub**

  `function` **`sub`**`(uint256 a, uint256 b) internal pure returns (uint256)`

  Subtracts two numbers, reverts on overflow \(i.e. if subtrahend is greater than minuend\).Parameters:`a` - uint256`b` - uint256Returns:uint256

