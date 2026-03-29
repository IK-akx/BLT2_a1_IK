const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Task 4: Inline Assembly", function () {
    let assemblyContract, solidityContract;
    let owner;
    
    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        
        const Assembly = await ethers.getContractFactory("contracts/task4/AssemblyContract.sol:AssemblyContract");
        assemblyContract = await Assembly.deploy();
        await assemblyContract.waitForDeployment();
        
        const Solidity = await ethers.getContractFactory("contracts/task4/SolidityOnly.sol:SolidityOnly");
        solidityContract = await Solidity.deploy();
        await solidityContract.waitForDeployment();
    });
    
    it("Should compare setValue gas costs", async function () {
        const value = 12345;
        
        const tx1 = await solidityContract.setValue(value);
        const receipt1 = await tx1.wait();
        console.log(`\nSolidity setValue gas: ${receipt1.gasUsed}`);
        
        const tx2 = await assemblyContract.setValueAssembly(value);
        const receipt2 = await tx2.wait();
        console.log(`Assembly setValue gas: ${receipt2.gasUsed}`);
        console.log(`Savings: ${Number(receipt1.gasUsed) - Number(receipt2.gasUsed)} gas`);
    });
    
    it("Should compare getValue gas costs", async function () {
        // First set values
        await solidityContract.setValue(100);
        await assemblyContract.setValueAssembly(100);
        
        // For view functions, use estimateGas instead of wait
        const solidityGas = await solidityContract.getValue.estimateGas();
        const assemblyGas = await assemblyContract.getValueAssembly.estimateGas();
        
        console.log(`\nSolidity getValue gas: ${solidityGas}`);
        console.log(`Assembly getValue gas: ${assemblyGas}`);
        console.log(`Savings: ${Number(solidityGas) - Number(assemblyGas)} gas`);
    });
    
    it("Should compare isPowerOfTwo gas costs", async function () {
        const testValue = 64;
        
        // For pure functions, use estimateGas
        const solidityGas = await solidityContract.isPowerOfTwo.estimateGas(testValue);
        const assemblyGas = await assemblyContract.isPowerOfTwoAssembly.estimateGas(testValue);
        
        console.log(`\nSolidity isPowerOfTwo gas: ${solidityGas}`);
        console.log(`Assembly isPowerOfTwo gas: ${assemblyGas}`);
        console.log(`Savings: ${Number(solidityGas) - Number(assemblyGas)} gas`);
    });
    
    it("Should verify both implementations work correctly", async function () {
        // Test setValue
        await solidityContract.setValue(42);
        let val = await solidityContract.value();
        expect(val).to.equal(42);
        
        await assemblyContract.setValueAssembly(42);
        let result = await assemblyContract.getValueAssembly();
        expect(result[0]).to.equal(42);
        
        // Test power of two
        let solidityResult = await solidityContract.isPowerOfTwo(64);
        let assemblyResult = await assemblyContract.isPowerOfTwoAssembly(64);
        expect(solidityResult).to.equal(assemblyResult);
        
        console.log("\n✓ Both implementations work correctly");
    });
});