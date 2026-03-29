// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VulnerableAccess {
    address public owner;
    uint256 public funds;
    
    constructor() {
        owner = msg.sender;
    }
    
    // VULNERABILITY: Anyone can call this function
    function setOwner(address newOwner) external {
        owner = newOwner;
    }
    
    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(msg.sender).transfer(address(this).balance);
    }
    
    receive() external payable {
        funds += msg.value;
    }
}