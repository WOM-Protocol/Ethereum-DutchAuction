pragma solidity ^0.4.24;

contract Bridge {

  struct Period {
    bytes32 parent; // the id of the parent node
    uint32 height;  // the height of last block in period
    uint32 parentIndex; //  the position of this node in the Parent's children list
    uint8 slot;
    uint32 timestamp;
    uint64 reward;
    bytes32[] children; // unordered list of children below this node
  }
  mapping(bytes32 => Period) public periods;

  struct Deposit {
    uint64 height;
    uint16 color;
    address owner;
    uint256 amount;
  }
  mapping(uint32 => Deposit) public deposits;

  uint256 public epochLength; // length of epoch in periods (32 blocks)
  bytes32 public tipHash;

  // return (slot.eventCounter, slot.owner, slot.stake, slot.signer, slot.tendermint, slot.activationEpoch, slot.newOwner, slot. newStake, slot.newSigner, slot.newTendermint);
  function getSlot(uint256 _slotId) constant public returns (uint32, address, uint64, address, bytes32, uint32, address, uint64, address, bytes32);

  function bet(uint256 _slotId, uint256 _value, address _signerAddr, bytes32 _tenderAddr, address _owner) public;

  function submitPeriod(uint256 _slotId, bytes32 _prevHash, bytes32 _root, uint256 _sigs) public;

  function reportDoubleSpend(bytes32[] _proof, bytes32[] _prevProof) public;

  function challengeExit(bytes32[] _proof, bytes32[] _prevProof, uint256 _oIndex, uint256 _inputIndex) public;

  function slashDoubleSig(uint256 _slotId, bytes32 _root1, uint8 _v1, bytes32 _r1, bytes32 _s1, bytes32 _root2, uint8 _v2, bytes32 _r2, bytes32 _s2) public;

  function getTip() public constant returns (bytes32, uint256);

  // CREDIT : Parsec Labs (parseclabs.org)
}
