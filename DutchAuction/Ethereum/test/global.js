const accounts = web3.eth.accounts;

module.exports = {
  TREASURY : accounts[0],
  ADMIN : accounts[1],
  OWNER : accounts[2],
  PARTICIPANT : accounts[5],
  TOKEN_SUPPLY : 1000000000000000000000000000,
  AUCTION_CAP : 350000000000000000000000000,
  TOKEN_NAME : 'WOMToken',
  TOKEN_SYMBOL : 'WOM',
  DECIMAL_UNITS : 18,
  DAY_EPOCH : 86400
}
