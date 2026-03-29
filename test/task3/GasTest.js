const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Task 3: Gas Optimization", function () {
    let unoptimized, optimized;
    let owner;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        
        const Unoptimized = await ethers.getContractFactory("contracts/task3/Unoptimized.sol:Unoptimized");
        unoptimized = await Unoptimized.deploy();
        await unoptimized.waitForDeployment();
        
        const Optimized = await ethers.getContractFactory("contracts/task3/Optimized.sol:Optimized");
        optimized = await Optimized.deploy();
        await optimized.waitForDeployment();
    });

    it("Should add multiple values - gas comparison", async function () {
        const values = [10, 20, 30, 40, 50];
        
        const tx1 = await unoptimized.addMultipleValues(values);
        const receipt1 = await tx1.wait();
        const gas1 = Number(receipt1.gasUsed);
        console.log(`\nUnoptimized addMultipleValues gas: ${gas1}`);
        
        const tx2 = await optimized.addMultipleValues(values);
        const receipt2 = await tx2.wait();
        const gas2 = Number(receipt2.gasUsed);
        console.log(`Optimized addMultipleValues gas: ${gas2}`);
        console.log(`Savings: ${gas1 - gas2} gas (${((gas1 - gas2) * 100 / gas1).toFixed(2)}%)`);
    });

    it("Should update balance - gas comparison", async function () {
        const tx1 = await unoptimized.updateBalance(100, true);
        const receipt1 = await tx1.wait();
        const gas1 = Number(receipt1.gasUsed);
        console.log(`\nUnoptimized updateBalance (deposit) gas: ${gas1}`);
        
        const tx2 = await optimized.updateBalance(100, true);
        const receipt2 = await tx2.wait();
        const gas2 = Number(receipt2.gasUsed);
        console.log(`Optimized updateBalance (deposit) gas: ${gas2}`);
        console.log(`Savings: ${gas1 - gas2} gas`);
    });

    it("Should increment counters - gas comparison", async function () {
        const tx1 = await unoptimized.incrementCounters();
        const receipt1 = await tx1.wait();
        const gas1 = Number(receipt1.gasUsed);
        console.log(`\nUnoptimized incrementCounters gas: ${gas1}`);
        
        const tx2 = await optimized.incrementCounters();
        const receipt2 = await tx2.wait();
        const gas2 = Number(receipt2.gasUsed);
        console.log(`Optimized incrementCounters gas: ${gas2}`);
        console.log(`Savings: ${gas1 - gas2} gas`);
    });
});