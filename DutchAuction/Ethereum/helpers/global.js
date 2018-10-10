let Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const accounts = web3.eth.accounts;

module.exports = {
  OWNER : accounts[0],
  ADMIN : accounts[1],
  TREASURY : accounts[2],
  PARTICIPANT_ONE : accounts[3],
  PARTICIPANT_TWO : accounts[4],
  PARTICIPANT_THREE : accounts[5],
  PARTICIPANT_PRESALE : accounts[6],
  NOT_OWNER : accounts[7],
  LOCKED_ACCOUNT : accounts[8],
  EMERGENCY_ADDRESS : accounts[9],
  BEGIN_TIME : web3.eth.getBlock(web3.eth.blockNumber).timestamp,
  TOKEN_SUPPLY : 1000000000000000000000000000,
  AUCTION_CAP : 350000000000000000000000000,
  TRAILING_DECIMALS : 000000000000000000,
  TOKEN_NAME : 'WOMToken',
  TOKEN_SYMBOL : 'WOM',
  DECIMAL_UNITS : 18,
  DAY_EPOCH : 86400,
  MONTH_EPOCH : 2629743,
  END_TIME : (15 * this.DAY_EPOCH),
  EMPTY_ADDRESS : '0x0000000000000000000000000000000000000000'
};
