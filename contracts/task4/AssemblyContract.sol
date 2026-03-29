// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AssemblyContract {
    uint256 public value;
    address public lastCaller;
    
    event ValueUpdated(uint256 newValue, address caller);
    
    // Assembly version with 3 operations
    function setValueAssembly(uint256 _value) external {
        assembly {
            // 1. Read msg.sender using caller()
            let sender := caller()
            
            // 2. Check if _value is power of 2 using AND
            let isPow2 := eq(and(_value, sub(_value, 1)), 0)
            
            // 3. Write to storage using sstore
            sstore(0, _value)      // slot 0 = value
            sstore(1, sender)      // slot 1 = lastCaller
        }
        
        emit ValueUpdated(_value, msg.sender);
    }
    
    function getValueAssembly() external view returns (uint256 val, address callerAddr) {
        assembly {
            val := sload(0)
            callerAddr := sload(1)
        }
    }
    
    function isPowerOfTwoAssembly(uint256 x) external pure returns (bool) {
        assembly {
            let result := and(x, sub(x, 1))
            mstore(0, eq(result, 0))
            return(0, 32)
        }
    }
    
    function isPowerOfTwoSolidity(uint256 x) external pure returns (bool) {
        if (x == 0) return false;
        return (x & (x - 1)) == 0;
    }
}