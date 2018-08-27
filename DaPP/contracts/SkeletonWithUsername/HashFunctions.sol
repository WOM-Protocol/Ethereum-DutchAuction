pragma solidity ^0.4.24;

contract HashFunctions {

  function uintHash(uint _param)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param));
  }

  function stringHash(string _name)
  external
  pure
  returns (bytes32){
    return keccak256(abi.encodePacked(_name));
  }

  function addressHash(address _param)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param));
  }


  function contractHash(string _name)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked("contract", _name));
  }

  function stringAddress(string _param, address _paramTwo)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param, _paramTwo));
  }

  function stringString(string _param, string _paramTwo)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param, _paramTwo));
  }

  function stringBytes(string _param, bytes32 _paramTwo)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param, _paramTwo));
  }

  function stringUint(string _param, uint _paramTwo)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param, _paramTwo));
  }

  function stringAddressString(string _param, address _paramTwo, string _paramThree)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param, _paramTwo, _paramThree));
  }

  function stringStringUint(string _param, string _paramTwo, uint _paramThree)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param, _paramTwo, _paramThree));
  }


  function stringBytesAddress(string _param, bytes32 _paramTwo, address _paramThree)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param, _paramTwo, _paramThree));
  }

  function addressUintUint(address _param, uint _paramTwo, uint _paramThree)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_param, _paramTwo, _paramThree));
  }


  function getAuthorizeHash(address _contractAddress, address _owner, string _fnName, bytes32 _recipient)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_contractAddress, _owner, _fnName, _recipient));
  }

  function uintUintUint(uint _paramOne, uint _paramTwo, uint _paramThree)
  external
  pure
  returns (bytes32) {
    return keccak256(abi.encodePacked(_paramOne, _paramTwo, _paramThree));
  }

  function nullBytes()
  external
  pure
  returns (bytes32) {
    return bytes32(0);
  }

  function nullAddress()
  external
  pure
  returns (address) {
    return address(0);
  }

function ()
public {
  revert();
}





}