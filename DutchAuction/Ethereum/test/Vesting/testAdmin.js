const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const BigNumber = web3.BigNumber;
const time = require('../helpers/time');
const expectEvent = require('../helpers/expectEvent');
const { ethGetBlock } = require('../helpers/web3');
const AssertRevert = require('../../helpers/AssertRevert.js');
const constants = require('../../helpers/global.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('TokenVesting', function ([_, owner, beneficiary]) {
  const PARTICIPANT_PURCHASE = web3.toWei(10,'ether');
  const PARTICIPANT_PURCHASE_WITH_BONUS = Number(PARTICIPANT_PURCHASE * 1.2);
  const PRESALE_PURCHASE = web3.toWei(22595,'ether');
  const PRESALE_PURCHASE_WITH_BONUS = Number(PRESALE_PURCHASE * 1.15);

  describe('grab deployed + initiate', () => {
		it('Grab needed deployed contracts', async () => {
			this.erc20Instance = await ERC20BurnableAndMintable.deployed();
			this.multiCertifierInstance = await MultiCertifier.deployed();
			this.tokenVestingInstance = await TokenVesting.deployed();
			this.auctionInstance = await SecondPriceAuction.deployed();
		});
		it('initialize - assignAuctionAddress()', async () => {
			await this.tokenVestingInstance.assignAuctionAddress(this.auctionInstance.address);
			assert.equal(await this.tokenVestingInstance.auctionAddress(), this.auctionInstance.address);
		});
    it('set times', async () => {
      this.cliffDuration = time.duration.years(1);
      this.duration = time.duration.years(2);
    });
  });

	describe('function - registerPresaleVest()', () => {
    it('trasnfer AUCTION_CAP to auction contract', async () => {
			await this.erc20Instance.transfer(this.auctionInstance.address, constants.AUCTION_CAP);
	    assert.equal(await this.erc20Instance.balanceOf(this.auctionInstance.address), constants.AUCTION_CAP);
			});

    it('catch not_empty_uint modifier ', async () => {
			let not_empty_uint = this.tokenVestingInstance.registerPresaleVest(false, constants.PARTICIPANT_PRESALE, this.cliffDuration);
			AssertRevert.assertRevert(not_empty_uint);
    });

		it('catch not_empty_address', async () => {
			let not_empty_address = this.tokenVestingInstance.registerPresaleVest(true, constants.EMPTY_ADDRESS, this.cliffDuration, this.duration);
			AssertRevert.assertRevert(not_empty_address);
		 });

		 it('correct register', async () => {
			 await this.tokenVestingInstance.registerPresaleVest(false, constants.PARTICIPANT_PRESALE, this.cliffDuration, this.duration);
			 await this.tokenVestingInstance.registerPresaleVest(true, constants.PARTICIPANT_PRESALE_TWO, this.cliffDuration, this.duration);
			 assert.equal(await this.tokenVestingInstance.registered(constants.PARTICIPANT_PRESALE), true);
			 assert.equal(await this.tokenVestingInstance.registered(constants.PARTICIPANT_PRESALE_TWO), true);
     });

		 it('catch not_registered modifier', async () => {
			 let not_registered = this.tokenVestingInstance.registerPresaleVest(false, constants.PARTICIPANT_PRESALE, this.cliffDuration, this.duration);
			 AssertRevert.assertRevert(not_registered);
 		 });

		 it('inject into auction', async () => {
			 await this.auctionInstance.inject(constants.PARTICIPANT_PRESALE, PRESALE_PURCHASE, 15, {from:constants.ADMIN});
       await this.auctionInstance.inject(constants.PARTICIPANT_PRESALE_TWO, PRESALE_PURCHASE, 15, {from:constants.ADMIN});
			 const PARTICIPANT_PRESALE_BUYINS = await this.auctionInstance.buyins(constants.PARTICIPANT_PRESALE);
			 const PARTICIPANT_PRESALE_TWO_BUYINS = await this.auctionInstance.buyins(constants.PARTICIPANT_PRESALE);
			 assert.equal(PARTICIPANT_PRESALE_BUYINS[2], true);
			 assert.equal(PARTICIPANT_PRESALE_TWO_BUYINS[2], true);
      });
	});

  describe('participation normal user()', () => {
    it('buyin', async () => {
			increaseTime(1000);
			const message = 'TLCS.'
			let hashedMessage = web3.sha3(message)
			assert.equal(await this.auctionInstance.STATEMENT_HASH(), hashedMessage);
			var sig = await web3.eth.sign(constants.PARTICIPANT_ONE, hashedMessage).slice(2)
			this.r = '0x' + sig.slice(0, 64)
			this.s = '0x' + sig.slice(64, 128)
			this.v = web3.toDecimal(sig.slice(128, 130)) + 27
			assert.equal(await this.auctionInstance.isSigned(constants.PARTICIPANT_ONE, hashedMessage, this.v, this.r, this.s), true);
			assert.equal(await this.auctionInstance.recoverAddr(hashedMessage, this.v, this.r, this.s), constants.PARTICIPANT_ONE);

			await this.multiCertifierInstance.certify(constants.PARTICIPANT_ONE);
			await this.auctionInstance.buyin(this.v, this.r, this.s, {from:constants.PARTICIPANT_ONE, value: PARTICIPANT_PURCHASE});
    });

		it('set time ended', async () => {
			increaseTime(time.duration.days(15));
			assert.equal(await this.auctionInstance.isActive(), false);
			assert.equal(await this.auctionInstance.softCapMet(), true);
		});
	});

	describe('function - finalise()', () => {
    it('finalize as PARTICIPANT_ONE', async () => {
	    await this.auctionInstance.finalise(constants.PARTICIPANT_ONE);
    });

		it('finalize as PARTICIPANT_PRESALE', async () => {
	    await this.auctionInstance.finalise(constants.PARTICIPANT_PRESALE);
    });

		it('finalize as PARTICIPANT_PRESALE', async () => {
	    await this.auctionInstance.finalise(constants.PARTICIPANT_PRESALE_TWO);
			this.start = await time.latest();
			userData = await this.tokenVestingInstance.userData(constants.PARTICIPANT_PRESALE_TWO);
			this.untouchedTotalTokens = userData[3];
 			assert.equal(await this.auctionInstance.isFinalized(), true);
    });

    it('validate', async () => {
			tokenCap = Number(await this.auctionInstance.tokenCap());
			perEach = Number(tokenCap / (PRESALE_PURCHASE_WITH_BONUS + PARTICIPANT_PURCHASE_WITH_BONUS));
			presaleAmount = Number(perEach * PRESALE_PURCHASE_WITH_BONUS);
			participantAmount = Number(perEach * PARTICIPANT_PURCHASE_WITH_BONUS);
			participantBalance = Number(await this.erc20Instance.balanceOf(constants.PARTICIPANT_ONE));
			this.presaleBalance = Number(await this.erc20Instance.allowance(this.auctionInstance.address, this.tokenVestingInstance.address));
			assert.notEqual(presaleBalance, 0);
			assert.notEqual(participantBalance, 0);
    });
  });

  describe('function release()', () => {
		it('can be released after cliff', async () => {
      await time.increaseTo(this.start + this.cliffDuration + time.duration.weeks(1));
      const { logs, receipt } = await this.tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
      expectEvent.inLogs(logs, 'TokensReleased', {
        who: constants.PARTICIPANT_PRESALE,
        amount: await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE),
      });
      const block = await ethGetBlock(receipt.blockNumber);
      const releaseTime = block.timestamp;

      const releasedAmount = new BigNumber(this.untouchedTotalTokens.mul(releaseTime - this.start).div(this.duration));
      userData = await this.tokenVestingInstance.userData(constants.PARTICIPANT_PRESALE);

      assert.equal(Number(await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE)), Number(releasedAmount));
      assert.equal(Number(userData[4]), Number(releasedAmount));
      assert.equal(Number(userData[3]), Number(this.untouchedTotalTokens.sub(releasedAmount)));
    });

    it('release() - catch is_registered modifier', async () => {
			let is_registered = this.tokenVestingInstance.release({from:constants.PARTICIPANT_ONE});
			AssertRevert.assertRevert(is_registered);
    });
  });

	describe('admin functionality tokenVesting', () => {
    it('function - assignAuctionAddress() catch require non-empty address', async () => {
			let require_address_0 = this.tokenVestingInstance.assignAuctionAddress(this.auctionInstance.address,{from:constants.OWNER});
	    AssertRevert.assertRevert(require_address_0);
    });

    it('function - emergencyDrain() catch not_locked modifier', async () => {
			await this.tokenVestingInstance.emergencyDrain(constants.EMERGENCY_ADDRESS).catch(function(err){
	      assert.include(err.message,'VM Exception');
	    });
    });

		it('function - revoke() PARTICIPANT_PRESALE catch revocable require ', async () => {
			let is_revocable = this.tokenVestingInstance.revoke(constants.PARTICIPANT_PRESALE, constants.EMERGENCY_ADDRESS, {from:constants.OWNER});
			AssertRevert.assertRevert(is_revocable);
		});

		it('function - revoke() PARTICIPANT_PRESALE_TWO ', async () => {
			userData = await this.tokenVestingInstance.userData(constants.PARTICIPANT_PRESALE_TWO);
			totalAccounted = Number(await this.tokenVestingInstance.totalAccounted());
			await this.tokenVestingInstance.revoke(constants.PARTICIPANT_PRESALE_TWO, constants.EMERGENCY_ADDRESS, {from:constants.OWNER});
			assert.equal(await this.tokenVestingInstance.revoked(constants.PARTICIPANT_PRESALE_TWO), true);
			assert.equal(Number(await this.erc20Instance.balanceOf(constants.EMERGENCY_ADDRESS)), Number(userData[3]));
			assert.equal(Number(await this.tokenVestingInstance.totalAccounted()), totalAccounted - Number(userData[3]));
			userData = await this.tokenVestingInstance.userData(constants.PARTICIPANT_PRESALE_TWO);
			assert.equal(Number(userData[3]), 0);
		});

    it('function - setLock() lock ', async () => {
			await this.tokenVestingInstance.setLock(true, {from:constants.OWNER});
			assert.equal(await this.tokenVestingInstance.locked(), true);
		});

		it('function - release() catch when_locked ', async () => {
			let locked = this.tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
	    AssertRevert.assertRevert(locked);
		});
/*
		it('function - emergencyDrain() when locked ', async () => {
			let balanceBefore = await this.erc20Instance.allowance(this.auctionInstance.address, this.tokenVestingInstance.address);

	    await this.tokenVestingInstance.emergencyDrain(constants.EMERGENCY_ADDRESS);
	    assert.equal(await this.erc20Instance.allowance(this.auctionInstance.address, this.tokenVestingInstance.address), 0);
	    assert.equal(Number(await this.erc20Instance.balanceOf(constants.EMERGENCY_ADDRESS)), Number(balanceBefore));
		});
		*/
  });
});
