const SecondPriceAuction = artifacts.require('./SecondPriceAuction.sol');
const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');
const TokenVesting = artifacts.require('./TokenVesting.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');
const constants = require('../../helpers/global.js');

const increaseTime = addSeconds => {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 1});
}

contract('testAdmin.js', function(accounts) {
  const END_TIME = (15 * constants.DAY_EPOCH);
  const YEAR_EPOCH = 31556926;
	const CLIFF_START = constants.BEGIN_TIME + YEAR_EPOCH + END_TIME;

	const PARTICIPANT_PURCHASE = web3.toWei(10,'ether');
	const PARTICIPANT_PURCHASE_WITH_BONUS = Number(PARTICIPANT_PURCHASE * 1.2);
	const PRESALE_PURCHASE = web3.toWei(45190,'ether');
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
	});

	describe('function - registerPresaleVest()', () => {
    it('trasnfer AUCTION_CAP to auction contract', async () => {
			await this.erc20Instance.transfer(this.auctionInstance.address, constants.AUCTION_CAP);
	    assert.equal(await this.erc20Instance.balanceOf(this.auctionInstance.address), constants.AUCTION_CAP);
			});

    it('catch not_empty_uint modifier ', async () => {
			let not_empty_uint = this.tokenVestingInstance.registerPresaleVest(constants.PARTICIPANT_PRESALE, CLIFF_START, 0, 25);
			AssertRevert.assertRevert(not_empty_uint);
    });

		it('catch not_empty_address', async () => {
			let notEmptyAddress = this.tokenVestingInstance.registerPresaleVest(constants.EMPTY_ADDRESS, CLIFF_START, YEAR_EPOCH, 25);
			AssertRevert.assertRevert(notEmptyAddress);
		 });

		 it('correct register', async () => {
			 await this.tokenVestingInstance.registerPresaleVest(constants.PARTICIPANT_PRESALE, CLIFF_START, YEAR_EPOCH, 25);
			 let users = await this.tokenVestingInstance.users(constants.PARTICIPANT_PRESALE);
			 assert.equal(users[0], CLIFF_START);
			 assert.equal(users[1], YEAR_EPOCH);
			 assert.equal(users[2], 25);
 		 });

		 it('catch not_registered modifier', async () => {
			 let not_registered = this.tokenVestingInstance.registerPresaleVest(constants.PARTICIPANT_PRESALE, CLIFF_START, YEAR_EPOCH, 25);
			 AssertRevert.assertRevert(not_registered);
			 //console.log('total accounted: ', Number(await this.auctionInstance.totalAccounted()));
		 	 //console.log('eth to wei: ', Number(web3.toWei(35971,'ether')));
 		 });

		 it('inject into auction', async () => {
			 await this.auctionInstance.inject(constants.PARTICIPANT_PRESALE, PRESALE_PURCHASE, 15, {from:constants.ADMIN});
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
			increaseTime(END_TIME);
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

	describe('tokenVesting contract', () => {
    it('validate transfer occured to contract ', async () => {
			let presaleBalance = Number(await this.erc20Instance.allowance(this.auctionInstance.address, this.tokenVestingInstance.address));
			let usersVest = await this.tokenVestingInstance.users(constants.PARTICIPANT_PRESALE);
			let shouldBeCliffRelease = presaleBalance * 0.25;
			let shouldBePaymentPerMonth = (presaleBalance - shouldBeCliffRelease) / (12);

			assert.equal(Number(usersVest[3]), shouldBeCliffRelease);
			assert.equal(Number(usersVest[4]), shouldBePaymentPerMonth);
			assert.equal(Number(usersVest[5]), presaleBalance);
			assert.equal(Number(usersVest[7]), presaleBalance);
		 });

    it('release() - catch is_registered modifier', async () => {
			let is_registered = this.tokenVestingInstance.release({from:constants.PARTICIPANT_ONE});
			AssertRevert.assertRevert(is_registered);
    });

    it('increase time to cliff then release ', async () => {
			increaseTime(YEAR_EPOCH+constants.DAY_EPOCH);
			await this.tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});

			let users = await this.tokenVestingInstance.users(constants.PARTICIPANT_PRESALE);
			assert.equal(Number(users[3]), Number(await this.erc20Instance.balanceOf(constants.PARTICIPANT_PRESALE)));
			assert.equal(Number(users[5]), Number(users[7]) - Number(users[3]));
			assert.equal(Number(users[6]), Number(users[3]));
			assert.equal(Number(users[8]), 1);
			assert.equal(users[9], true);
		  });
  });

	describe('admin functionality tokenVesting', () => {
    it('function - assignAuctionAddress() catch require non-empty address', async () => {
			let require_address_0 = this.tokenVestingInstance.assignAuctionAddress(this.auctionInstance.address,{from:constants.OWNER});
	    AssertRevert.assertRevert(require_address_0);
    });

    it('function - emergencyDrain() catch not_locked modifier', async () => {
			let not_locked = this.tokenVestingInstance.emergencyDrain(constants.EMERGENCY_ADDRESS);
	    AssertRevert.assertRevert(not_locked);
    });

    it('function - setLock() lock ', async () => {
			await this.tokenVestingInstance.setLock(true, {from:constants.OWNER});
			assert.equal(await this.tokenVestingInstance.locked(), true);
		});

		it('function - release() catch when_locked ', async () => {
			let locked = this.tokenVestingInstance.release({from:constants.PARTICIPANT_PRESALE});
	    AssertRevert.assertRevert(locked);
		});

		it('function - emergencyDrain() when locked ', async () => {
			let balanceBefore = await this.erc20Instance.allowance(this.auctionInstance.address, this.tokenVestingInstance.address);

	    await this.tokenVestingInstance.emergencyDrain(constants.EMERGENCY_ADDRESS);
	    assert.equal(await this.erc20Instance.allowance(this.auctionInstance.address, this.tokenVestingInstance.address), 0);
	    assert.equal(Number(await this.erc20Instance.balanceOf(constants.EMERGENCY_ADDRESS)), Number(balanceBefore));
		});
  });
});
