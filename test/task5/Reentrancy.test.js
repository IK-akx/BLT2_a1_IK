const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Attack", function () {
    let vulnerableVault, fixedVault, attacker;
    let owner, user;
    
    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        
        const VulnerableVault = await ethers.getContractFactory("contracts/task5/VulnerableVault.sol:VulnerableVault");
        vulnerableVault = await VulnerableVault.deploy();
        await vulnerableVault.waitForDeployment();
        
        const FixedVault = await ethers.getContractFactory("contracts/task5/FixedVault.sol:FixedVault");
        fixedVault = await FixedVault.deploy();
        await fixedVault.waitForDeployment();
    });
    
    describe("Vulnerable Vault - BEFORE FIX", function () {
        it("Should be exploited by reentrancy attack", async function () {
            // Fund the vault using deposit function
            await vulnerableVault.deposit({ value: ethers.parseEther("10") });
            
            const initialVaultBalance = await vulnerableVault.getBalance();
            console.log(`\nInitial vault balance: ${ethers.formatEther(initialVaultBalance)} ETH`);
            
            // Deploy attacker
            const Attacker = await ethers.getContractFactory("contracts/task5/Attacker.sol:Attacker");
            attacker = await Attacker.deploy(await vulnerableVault.getAddress());
            await attacker.waitForDeployment();
            
            // Fund attacker with 1 ETH
            await attacker.attack({ value: ethers.parseEther("1") });
            
            const finalVaultBalance = await vulnerableVault.getBalance();
            const stolenAmount = await attacker.getStolenAmount();
            
            console.log(`Final vault balance: ${ethers.formatEther(finalVaultBalance)} ETH`);
            console.log(`Stolen amount: ${ethers.formatEther(stolenAmount)} ETH`);
            
            expect(finalVaultBalance).to.be.lt(initialVaultBalance);
            expect(stolenAmount).to.be.gt(0);
        });
    });
    
    describe("Fixed Vault - AFTER FIX", function () {
        it("Should resist reentrancy attack", async function () {
            // Fund the vault
            await fixedVault.deposit({ value: ethers.parseEther("10") });
            
            const initialVaultBalance = await fixedVault.getBalance();
            console.log(`\nInitial vault balance: ${ethers.formatEther(initialVaultBalance)} ETH`);
            
            // Deploy attacker
            const Attacker = await ethers.getContractFactory("contracts/task5/Attacker.sol:Attacker");
            attacker = await Attacker.deploy(await fixedVault.getAddress());
            await attacker.waitForDeployment();
            
            // Try attack - should fail
            await expect(
                attacker.attack({ value: ethers.parseEther("1") })
            ).to.be.reverted;
            
            const finalVaultBalance = await fixedVault.getBalance();
            console.log(`Final vault balance: ${ethers.formatEther(finalVaultBalance)} ETH`);
            
            expect(finalVaultBalance).to.equal(initialVaultBalance);
        });
    });
});