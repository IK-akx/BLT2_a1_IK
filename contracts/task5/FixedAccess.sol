// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FixedAccess is Ownable {
    uint256 public funds;
    
    // FIX: Using Ownable's onlyOwner modifier
    function setOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {
        funds += msg.value;
    }
}