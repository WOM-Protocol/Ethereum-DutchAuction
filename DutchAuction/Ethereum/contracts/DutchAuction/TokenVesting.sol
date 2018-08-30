pragma solidity 0.4.24;

import '../Libraries/SafeMath.sol';


contract ApproveAndCallFallBack {
    function receiveApproval(address from, uint tokens, address token, bytes data) public;
}


// ----------------------------------------------------------------------------
// Receive approval and then execute function
// ----------------------------------------------------------------------------

contract TokenVesting{
    using SafeMath for *;

    function receiveApproval(address from, uint tokens, address token, bytes data)
    public {
      bytesToAddress(data);
    }


    function bytesToAddress(bytes bys) private pure returns (address addr) {
    assembly {
      addr := mload(add(bys,20))
    }
}

}
