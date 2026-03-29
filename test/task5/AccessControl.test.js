const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Access Control Vulnerability", function () {
    let vulnerableAccess, fixedAccess;
    let owner, attacker;
    
    beforeEach(async function () {
        [owner, attacker] = await ethers.getSigners();
        
        const VulnerableAccess = await ethers.getContractFactory("contracts/task5/VulnerableAccess.sol:VulnerableAccess");
        vulnerableAccess = await VulnerableAccess.deploy();
        await vulnerableAccess.waitForDeployment();
        
        const FixedAccess = await ethers.getContractFactory("contracts/task5/FixedAccess.sol:FixedAccess");
        fixedAccess = await FixedAccess.deploy();
        await fixedAccess.waitForDeployment();
    });
    
    describe("Vulnerable Access - BEFORE FIX", function () {
        it("Should allow anyone to change owner", async function () {
            console.log(`\nOriginal owner: ${await vulnerableAccess.owner()}`);
            console.log(`Attacker address: ${attacker.address}`);
            
            // Attacker changes owner
            await vulnerableAccess.connect(attacker).setOwner(attacker.address);
            
            const newOwner = await vulnerableAccess.owner();
            console.log(`New owner after attack: ${newOwner}`);
            
            expect(newOwner).to.equal(attacker.address);
        });
        
        it("Should allow attacker to withdraw funds", async function () {
            // Send funds to contract
            await owner.sendTransaction({
                to: await vulnerableAccess.getAddress(),
                value: ethers.parseEther("5")
            });
            
            // Attacker changes owner and withdraws
            await vulnerableAccess.connect(attacker).setOwner(attacker.address);
            const beforeWithdraw = await ethers.provider.getBalance(attacker.address);
            
            await vulnerableAccess.connect(attacker).withdraw();
            
            const afterWithdraw = await ethers.provider.getBalance(attacker.address);
            expect(afterWithdraw).to.be.gt(beforeWithdraw);
            console.log(`\nAttack successful! Attacker stole funds`);
        });
    });
    
    describe("Fixed Access - AFTER FIX", function () {
        it("Should prevent non-owner from changing owner", async function () {
            console.log(`\nOwner: ${await fixedAccess.owner()}`);
            
            await expect(
                fixedAccess.connect(attacker).setOwner(attacker.address)
            ).to.be.reverted;
            
            const ownerStill = await fixedAccess.owner();
            expect(ownerStill).to.equal(owner.address);
            console.log(`Owner unchanged: ${ownerStill}`);
        });
        
        it("Should only allow owner to withdraw", async function () {
            await owner.sendTransaction({
                to: await fixedAccess.getAddress(),
                value: ethers.parseEther("5")
            });
            
            await expect(
                fixedAccess.connect(attacker).withdraw()
            ).to.be.reverted;
            
            // Owner can withdraw
            await expect(fixedAccess.connect(owner).withdraw()).to.not.be.reverted;
            console.log(`\nOnly owner can withdraw - fixed correctly`);
        });
    });
});