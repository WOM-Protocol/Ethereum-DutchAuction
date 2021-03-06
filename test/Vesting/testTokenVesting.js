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

		it('initialize - setAuctionAddress()', async () => {
			await this.tokenVestingInstance.setAuctionAddress(this.auctionInstance.address);
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

	    it('catch notEmptyUint modifier ', async () => {
			let notEmptyUint = this.tokenVestingInstance.registerPresaleVest(false, constants.PARTICIPANT_PRESALE, this.cliffDuration);
			AssertRevert.assertRevert(notEmptyUint);
	    });

		it('catch notEmptyAddress', async () => {
			let notEmptyAddress = this.tokenVestingInstance.registerPresaleVest(true, constants.EMPTY_ADDRESS, this.cliffDuration, this.duration);
			AssertRevert.assertRevert(notEmptyAddress);
		 });

		 it('correct register', async () => {
			 await this.tokenVestingInstance.registerPresaleVest(false, constants.PARTICIPANT_PRESALE, this.cliffDuration, this.duration);
			 await this.tokenVestingInstance.registerPresaleVest(true, constants.PARTICIPANT_PRESALE_TWO, this.cliffDuration, this.duration);
			 assert.equal(await this.tokenVestingInstance.registered(constants.PARTICIPANT_PRESALE), true);
			 assert.equal(await this.tokenVestingInstance.registered(constants.PARTICIPANT_PRESALE_TWO), true);
     	});

		 it('catch notRegistered modifier', async () => {
			 let notRegistered = this.tokenVestingInstance.registerPresaleVest(false, constants.PARTICIPANT_PRESALE, this.cliffDuration, this.duration);
			 AssertRevert.assertRevert(notRegistered);
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

		it('finalize as PARTICIPANT_PRESALE_TWO', async () => {
			const { receipt } = await this.auctionInstance.finalise(constants.PARTICIPANT_PRESALE_TWO);
			const block = await ethGetBlock(receipt.blockNumber);
			this.start = block.timestamp;
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
		it('attempt to release before cliff', async () => {
			let not_before_cliff = this.tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
			AssertRevert.assertRevert(not_before_cliff);
		});

		it('can be released after cliff', async () => {
			await time.increaseTo(this.start + this.cliffDuration + time.duration.weeks(1));
			const { logs, receipt } =await this.tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
			expectEvent.inLogs(logs, 'TokensReleased', {
				who: constants.PARTICIPANT_PRESALE,
				amount: await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE),
			});
			const block = await ethGetBlock(receipt.blockNumber);
			const releaseTime = block.timestamp;

			const releasedAmount = this.untouchedTotalTokens.mul(releaseTime - this.start).div(this.duration).floor();
			userData = await this.tokenVestingInstance.userData(constants.PARTICIPANT_PRESALE);

			assert.equal(Number(await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE)), Number(releasedAmount));
			assert.equal(Number(userData[4]), Number(releasedAmount));
			assert.equal(Number(userData[3]), Number(this.untouchedTotalTokens.sub(releasedAmount)));
    	});

    	it('should linearly release tokens during vesting period', async () => {
      		const vestingPeriod = this.duration - this.cliffDuration;
      		const checkpoints = 4;

      		for (let i = 1; i <= checkpoints; i++) {
        		const now = this.start + this.cliffDuration + i * (vestingPeriod / checkpoints);
		        await time.increaseTo(now);
		        await this.tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
		        const expectedVesting = (this.untouchedTotalTokens.mul(now - this.start).div(this.duration)).floor();
				(await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE)).should.bignumber.equal(expectedVesting);
				//assert.equal(Number(await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE)), Number(expectedVesting));
		        userData = await this.tokenVestingInstance.userData(constants.PARTICIPANT_PRESALE);
				if(i < 4){
					(await this.tokenVestingInstance.getReleased(constants.PARTICIPANT_PRESALE)).should.bignumber.equal(expectedVesting);
				}
				else{
					assert.equal(userData[4], 0);
				}
      		}
			(await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE)).should.bignumber.equal(this.untouchedTotalTokens);
    	});

		it('should have released all after end', async () => {
			await time.increaseTo(this.start + this.duration + time.duration.days(15));
			await this.tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE_TWO});
			assert.equal(Number(await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE_TWO)), Number(this.untouchedTotalTokens));
			userData = await this.tokenVestingInstance.userData(constants.PARTICIPANT_PRESALE_TWO);
			assert.equal(Number(userData[4]), 0);
		});

		it('validate all finalized', async () => {
			assert.equal(await this.tokenVestingInstance.getFinalized(), true);
			assert.equal(await this.tokenVestingInstance.registered(constants.PARTICIPANT_PRESALE), false);
			userData = await this.tokenVestingInstance.userData(constants.PARTICIPANT_PRESALE);
			assert.equal(userData[0], 0);
		});
  	});
});
