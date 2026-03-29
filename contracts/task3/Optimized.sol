// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Optimized {
    // OPTIMIZATION 1: Storage packing
    address public owner;
    bool public isActive;
    bool public isPaused;
    uint8 public smallNumber;
    
    uint256 public counter1;
    uint256 public counter2;
    uint256 public counter3;
    
    uint256[] public values;
    mapping(address => uint256) public balances;
    
    // OPTIMIZATION 2: Constant (compile-time)
    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    event ValueAdded(address indexed user, uint256 value);
    event BalanceUpdated(address indexed user, uint256 balance);
    // Убрали лишний event который увеличивал газ
    
    constructor() {
        owner = msg.sender;
        isActive = true;
        isPaused = false;
        smallNumber = 42;
    }
    
    // OPTIMIZATION 3: calldata + caching + unchecked
    function addMultipleValues(uint256[] calldata newValues) external {
        address sender = msg.sender;
        uint256 length = newValues.length;
        
        for (uint256 i = 0; i < length;) {
            uint256 val = newValues[i];
            values.push(val);
            balances[sender] += val;
            emit ValueAdded(sender, val);
            unchecked { i++; }
        }
    }
    
    // OPTIMIZATION 4: Short-circuiting + caching
    function updateBalance(uint256 amount, bool isDeposit) external {
        require(isActive, "Not active");
        require(amount > 0, "Amount > 0");
        
        if (isDeposit) {
            balances[msg.sender] += amount;
        } else {
            uint256 bal = balances[msg.sender];
            require(bal >= amount, "Insufficient");
            balances[msg.sender] = bal - amount;
        }
        emit BalanceUpdated(msg.sender, balances[msg.sender]);
    }
    
    // OPTIMIZATION 5: Unchecked batch increment (без event)
    function incrementCounters() external {
        unchecked {
            counter1++;
            counter2++;
            counter3++;
        }
    }
    
    function getTotal() external view returns (uint256) {
        return counter1 + counter2 + counter3;
    }
    
    function getValues() external view returns (uint256[] memory) {
        return values;
    }
}