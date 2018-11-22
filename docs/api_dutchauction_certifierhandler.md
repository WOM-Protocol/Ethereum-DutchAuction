---
id: DutchAuction_CertifierHandler
title: CertifierHandler
---

# CertifierHandler.sol

## contract CertifierHandler

is [Ownable](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html)

This contract can be used by certified people to change their certification address. How it works: 1. A trasaction must be sent from the first certified address, which will contain as argument the new address to certify 2. An event is emitted by the contract, which a process will listen to. It will immediately call \`revoke\(old\_address\)\` and then \`certify\(new\_address\)\` in order change the certification address. 3. The certifier account calls \`settle\` so that the entry is deleted from this contract. A small fee will be asked in order to pay for the transaction costs \(3 transactions are sent\). After the modification of the certified address, the sender and the new account are both locked. This is to prevent people change constantly their certified address.Source: [DutchAuction/CertifierHandler.sol](https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/DutchAuction/CertifierHandler.sol)Author: Nicolas Gotchac &lt;nicolas@parity.io&gt;

## Index

* [Drained](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#Drained)
* [Locked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#Locked)
* [NewFee](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#NewFee)
* [NewTreasury](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#NewTreasury)
* [Requested](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#Requested)
* [Transfered](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#Transfered)
* [claim](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#claim)
* [drain](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#drain)
* [fallback](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html)
* [only\_unlocked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#only_unlocked)
* [setFee](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#setFee)
* [setLocked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#setLocked)
* [setTreasury](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#setTreasury)
* [settle](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#settle)

## Reference

### Events

* **Drained**

  `event` **`Drained`**`(uint _balance)`

  EVENTS.Parameters:`_balance` - uint

* **Locked**

  `event` **`Locked`**`(address _who)`

  Parameters:`_who` - address

* **NewFee**

  `event` **`NewFee`**`(uint _oldFee, uint _newFee)`

  Parameters:`_oldFee` - uint`_newFee` - uint

* **NewTreasury**

  `event` **`NewTreasury`**`(address _oldTreasury, address _newTreasury)`

  Parameters:`_oldTreasury` - address`_newTreasury` - address

* **Requested**

  `event` **`Requested`**`(address _sender, address _who)`

  Parameters:`_sender` - address`_who` - address

* **Transfered**

  `event` **`Transfered`**`(address _sender, address _who, address _certifier)`

  Parameters:`_sender` - address`_who` - address`_certifier` - address

### Modifiers

* **only\_unlocked**

  `modifier` **`only_unlocked`**`(address _who)`

  MODIFIERS.Parameters:`_who` - address

### Functions

* **claim**

  `function` **`claim`**`(address who) public payable`

  PUBLIC METHODS, This method will be called by certified accounts that which to certify another address. This function can only be called once per user. After a successful re-certification, these two accounts are locked, and cannot ask for another re-certification.Modifiers:[only\_unlocked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#only_unlocked) [only\_unlocked](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/DutchAuction_CertifierHandler.html#only_unlocked)Parameters:`who` - The address to which the certification should be transfered

* **drain**

  `function` **`drain`**`() external`

  RESTRICTED \(owner or delegate only\) PUBLIC METHODS, Send the current balance to the treasury. Could be needed if value is sent outside of the \`claim\` method \(eg. contract suicide\).Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)

* **fallback**

  `function (address _certifier, address _treasury) public`

  CONSTRUCTOR, Contructor method of the contract, which will set the \`certifier\` address.Parameters:`_certifier` - The address of the main certifier`_treasury` - The address of the treasury

* **setFee**

  `function` **`setFee`**`(uint _fee) external`

  Change the fee, needed if for whatever reason gas price must be modified. Only the owner of the contract can execute this method.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_fee` - The new fee

* **setLocked**

  `function` **`setLocked`**`(address _who) external`

  The owner can lock an account, which is basically a blacklist. This shouldn't be used often ; but could be useful for re-deployment of new contract for example.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_who` - The account to lock.

* **setTreasury**

  `function` **`setTreasury`**`(address _treasury) external`

  Change the address of the treasury, the address to which the payments are forwarded to. Only the owner of the contract can execute this method.Modifiers:[onlyOwner](https://github.com/WOM-Protocol/WOM-DutchAuction-Documentation/tree/32f9e94995bf5f343ec0fecfe8bc948e5b09bb03/docs/Libraries_Ownable.html#onlyOwner)Parameters:`_treasury` - The new treasury address

* **settle**

  `function` **`settle`**`(address sender) public`

  This method is called by the certifier account in order to remove the pending request of modification of the certified address. Anyone can call this method, since it checks that the pending request has actually gone through \(modification of certification address\).Parameters:`sender` - address

