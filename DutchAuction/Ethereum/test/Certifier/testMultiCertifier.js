const MultiCertifier = artifacts.require('./MultiCertifier.sol');
const CertifierHandler = artifacts.require('./CertifierHandler.sol');
const ERC20BurnableAndMintable = artifacts.require('./ERC20BurnableAndMintable.sol');

const AssertRevert = require('../../helpers/AssertRevert.js');

contract('MultiCertifier.sol', function(accounts) {
  const OWNER = accounts[0];
	const ADMIN = accounts[1];
  const TREASURY = accounts[2];
  const PARTICIPANT1 = accounts[3];
	const PARTICIPANT2 = accounts[4];
  const PARTICIPANT3 = accounts[5];

	const TOKEN_SUPPLY = 1000000000;
	const TOKEN_NAME = 'WOMToken';
	const TOKEN_SYMBOL = 'WOM';
	const DECIMAL_UNITS = 18;

	let multiCertifierInstance;
	let erc20Instance;

	it('Deploy Token', async () => {
		erc20Instance = await ERC20BurnableAndMintable.new(
			TOKEN_SUPPLY, TOKEN_NAME, 18, TOKEN_SYMBOL);
	});

	it('Deply MultiCertifier', async () => {
		multiCertifierInstance = await MultiCertifier.new();
	});


  it('Add Delegate', async () => {
    /* ---- only_owner; ---- */
   let only_owner = multiCertifierInstance.addDelegate(ADMIN, {from:PARTICIPANT1});
   AssertRevert.assertRevert(only_owner);

    await multiCertifierInstance.addDelegate(ADMIN);
    assert.equal(await multiCertifierInstance.delegates(ADMIN), true, 'Delegate added');
    assert.equal(await multiCertifierInstance.delegates(PARTICIPANT1), false, 'Delegate false');
    });

  it('Remove delegate', async () => {
    let only_owner = multiCertifierInstance.removeDelegate(ADMIN, {from:PARTICIPANT1});
    AssertRevert.assertRevert(only_owner);

    await multiCertifierInstance.removeDelegate(ADMIN);
    assert.equal(await multiCertifierInstance.delegates(ADMIN), false, 'Delegate removed');
    await multiCertifierInstance.addDelegate(ADMIN);
  });

  it('certify', async () => {
    /* ---- only_delegate; not delgate/owner ---- */
    let only_delegate_neither = multiCertifierInstance.certify(PARTICIPANT2, {from:PARTICIPANT1});
    AssertRevert.assertRevert(only_delegate_neither);

    /* ---- from owner ---- */
    await multiCertifierInstance.certify(PARTICIPANT2);
    let certs = await multiCertifierInstance.certs(PARTICIPANT2);
    assert.equal(certs[1], true, 'PARTICIPANT2 added');
    assert.equal(certs[0], OWNER, 'PARTICIPANT2 added');

    let certified = await multiCertifierInstance.certified(PARTICIPANT2);
    assert.equal(certified, true, 'certified getter true');

    let certifier = await multiCertifierInstance.getCertifier(PARTICIPANT2);
    assert.equal(certifier, OWNER, 'certifier getter equal to owner');

    /* ---- only_uncertified ---- */
    let only_uncertified = multiCertifierInstance.certify(PARTICIPANT2);
    AssertRevert.assertRevert(only_uncertified);
  });

  it('revoke', async () => {
    /* ---- only_certifier_of; not certifier ---- */
    let only_certifier_of = multiCertifierInstance.revoke(PARTICIPANT2, {from:PARTICIPANT1});
    AssertRevert.assertRevert(only_certifier_of);

    /* ---- only_certified ---- */
    let only_certifier = multiCertifierInstance.revoke(PARTICIPANT1);
    AssertRevert.assertRevert(only_certifier);

    await multiCertifierInstance.revoke(PARTICIPANT2);
    let certs = await multiCertifierInstance.certs(PARTICIPANT2);
    assert.equal(certs[1], false, 'PARTICIPANT2 added');
    assert.equal(certs[0], OWNER, 'PARTICIPANT2 added');
  });

  it('Unused interface functions', async () => {
    await multiCertifierInstance.get(PARTICIPANT1, 'test');
    await multiCertifierInstance.getAddress(PARTICIPANT1, 'test');
    await multiCertifierInstance.getUint(PARTICIPANT1, 'test');
  });
});
