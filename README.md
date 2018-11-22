<p align="center">
  <a href="https://womprotocol.io/">
    <img alt="WOMProtocol Logo" src="https://womprotocol.io/svg/WOM_LOGO.svg" width="90">
  </a>
</p>

# WOMProtocol-Tokensale

[![CircleCI]() [![Coverage Status]()

All the contracts and tests related to the token sale for the WOM token.

## Details
The token contract will release 350m WOM tokens available for purchase in the dutch auction.  The dutch auction shall last for 15 days, and the token price shall be worked out at the end of this 15 day period from the amount of Ether that has been contributed.  If the softcap of 10m is reached, regardless if 50m was contributed or 10m, the 350m tokens will be distributed between the investors.  Within the first 4 days of the Dutch Auction, investors will recieve a bonus.  

* Length: 15 days
* Tokens: 350,000,000 WOM
* Funding Currency: Ether
* Price: 350m/TotalContributedEther
* Bonus:
    * Day 1 : 20%
    * Day 2 : 15%
    * Day 3 : 10%
    * Day 4 : 5%

## Testing
Clone the repo
```
git clone https://github.com/WOM-Protocol/Ethereum-DutchAuction.git
```

To get the dependencies run:
```
npm install
```

In another terminal window run:
```
./node_modules/.bin/testrpc-sc -g 0x01 -l 0xfffffffffff -e 1000000000000000 -a 11  
```

Run tests
```
truffle test
```

## Guide
The contract is initated with an initial WEI price equal to 1 USD, and keeps track of the total amount of WEI contributed over the 15 day period.  An investor will simply send the amount of Ether they wish to contribute, then at the end of the 15 days they claim their tokens.

All of our Smart Contracts have been documented and are viewable [here](https://connorblockchain.gitbook.io/wom-dutchauction/).


## WOM Documents
You can read the current WOMToken light paper[here](https://womprotocol.io/pdf/wom-lightpaper.pdf).     
You can read the current WOMToken whitepaper [here](https://womprotocol.io/pdf/wom-whitepaper.pdf).  

## Contact and Additional Information
Check out our website for more information on WOMToken.  

Contact email: [info@womprotocol.io](info@womprotocol.io)  
Twitter: [https://twitter.com/womprotocol](https://twitter.com/womprotocol)  
Medium: [https://medium.com/wom-protocol](https://medium.com/wom-protocol)  
Join our Telegram channel! [https://t.me/womtokenofficial](https://t.me/womtokenofficial)  
