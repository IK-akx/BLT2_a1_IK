// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Unoptimized {
    // Poor storage packing - uses 3 slots
    uint256 public counter1;
    uint256 public counter2;
    uint256 public counter3;
    address public owner;
    bool public isActive;
    bool public isPaused;
    uint8 public smallNumber;
    
    uint256[] public values;
    
    mapping(address => uint256) public balances;
    
    address public constantOwner;
    
    event ValueAdded(address indexed user, uint256 value);
    event BalanceUpdated(address indexed user, uint256 balance);
    
    constructor() {
        owner = msg.sender;
        isActive = true;
        isPaused = false;
        smallNumber = 42;
        constantOwner = 0x000000000000000000000000000000000000dEaD;
    }
    
    // Uses memory instead of calldata for read-only array
    function addMultipleValues(uint256[] memory newValues) external {
        for (uint256 i = 0; i < newValues.length; i++) {
            values.push(newValues[i]);
            balances[msg.sender] += newValues[i];
            emit ValueAdded(msg.sender, newValues[i]);
        }
    }
    
    // Poor condition ordering
    function updateBalance(uint256 amount, bool isDeposit) external {
        require(amount > 0, "Amount must be > 0");
        require(isActive == true, "Contract not active");
        require(msg.sender != address(0), "Invalid sender");
        
        if (isDeposit == true) {
            balances[msg.sender] += amount;
        } else {
            require(balances[msg.sender] >= amount, "Insufficient balance");
            balances[msg.sender] -= amount;
        }
        
        emit BalanceUpdated(msg.sender, balances[msg.sender]);
    }
    
    // Expensive storage write to counter
    function incrementCounters() external {
        counter1++;
        counter2++;
        counter3++;
    }
    
    function getTotal() external view returns (uint256) {
        return counter1 + counter2 + counter3;
    }
    
    function getValues() external view returns (uint256[] memory) {
        return values;
    }
}