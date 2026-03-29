// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SolidityOnly {
    uint256 public value;
    address public lastCaller;
    
    event ValueUpdated(uint256 newValue, address caller);
    
    function setValue(uint256 _value) external {
        value = _value;
        lastCaller = msg.sender;
        emit ValueUpdated(_value, msg.sender);
    }
    
    function getValue() external view returns (uint256, address) {
        return (value, lastCaller);
    }
    
    function isPowerOfTwo(uint256 x) external pure returns (bool) {
        if (x == 0) return false;
        return (x & (x - 1)) == 0;
    }
}