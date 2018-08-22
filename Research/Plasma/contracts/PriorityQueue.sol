pragma solidity ^0.4.18;

import "./Libraries/SafeMath.sol";
import "./ERC20/ERC20BurnableAndMintable.sol";

/**
 * @title PriorityQueue
 * @dev A priority queue implementation
 */

library PriorityQueue {
  using SafeMath for uint256;

  struct Token {
    ERC20BurnableAndMintable addr;
    uint256[] heapList;
    uint256 currentSize;
  }

  function insert(Token storage self, uint256 k) public {
    self.heapList.push(k);
    self.currentSize = self.currentSize.add(1);
    percUp(self, self.currentSize);
  }

  function minChild(Token storage self, uint256 i) public view returns (uint256) {
    if (i.mul(2).add(1) > self.currentSize) {
      return i.mul(2);
    } else {
      if (self.heapList[i.mul(2)] < self.heapList[i.mul(2).add(1)]) {
        return i.mul(2);
      } else {
        return i.mul(2).add(1);
      }
    }
  }

  function getMin(Token storage self) public view returns (uint256) {
    return self.heapList[1];
  }

  function delMin(Token storage self) public returns (uint256) {
    uint256 retVal = self.heapList[1];
    self.heapList[1] = self.heapList[self.currentSize];
    delete self.heapList[self.currentSize];
    self.currentSize = self.currentSize.sub(1);
    percDown(self, 1);
    self.heapList.length = self.heapList.length.sub(1);
    return retVal;
  }

  function percUp(Token storage self, uint256 i) private {
    uint256 j = i;
    uint256 newVal = self.heapList[i];
    while (newVal < self.heapList[i.div(2)]) {
      self.heapList[i] = self.heapList[i.div(2)];
      i = i.div(2);
    }
    if (i != j) self.heapList[i] = newVal;
  }

  function percDown(Token storage self, uint256 i) private {
    uint256 j = i;
    uint256 newVal = self.heapList[i];
    uint256 mc = minChild(self, i);
    while (mc <= self.currentSize && newVal > self.heapList[mc]) {
      self.heapList[i] = self.heapList[mc];
      i = mc;
      mc = minChild(self, i);
    }
    if (i != j) self.heapList[i] = newVal;
  }

  // CREDIT : Parsec Labs (parseclabs.org)

}
