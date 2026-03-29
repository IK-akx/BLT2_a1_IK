const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Task 1: Factory Pattern", function () {
    let factory;
    let owner;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("contracts/task1/Factory.sol:Factory");
        factory = await Factory.deploy();
        await factory.waitForDeployment();
    });

    describe("CREATE vs CREATE2 Gas Comparison", function () {
        it("Should deploy with CREATE and measure gas", async function () {
            const tx = await factory.deployWithCreate("Test1", { value: ethers.parseEther("1") });
            const receipt = await tx.wait();
            
            console.log(`\nCREATE Gas Used: ${receipt.gasUsed}`);
            expect(receipt.status).to.equal(1);
        });

        it("Should deploy with CREATE2 and measure gas", async function () {
            const salt = ethers.encodeBytes32String("salt123");
            const tx = await factory.deployWithCreate2("Test2", salt, { value: ethers.parseEther("1") });
            const receipt = await tx.wait();
            
            console.log(`\nCREATE2 Gas Used: ${receipt.gasUsed}`);
            expect(receipt.status).to.equal(1);
        });

        it("Should pre-compute CREATE2 address correctly", async function () {
            const salt = ethers.encodeBytes32String("precomputed");
            const name = "PreTest";
            
            const computedBefore = await factory.getCreate2Address(name, salt);
            
            const tx = await factory.deployWithCreate2(name, salt, { value: ethers.parseEther("1") });
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => log.fragment.name === "Deployed");
            const actualAddress = event.args[0];
            
            expect(computedBefore).to.equal(actualAddress);
            console.log(`\nPre-computed address matches: ${computedBefore}`);
        });
    });

    describe("Factory Storage", function () {
        it("Should store all deployed contract addresses", async function () {
            await factory.deployWithCreate("Contract1");
            await factory.deployWithCreate("Contract2");
            await factory.deployWithCreate2("Contract3", ethers.encodeBytes32String("salt"));
            
            const contracts = await factory.getDeployedContracts();
            expect(contracts.length).to.equal(3);
            console.log(`\nStored ${contracts.length} contract addresses`);
        });
    });

    describe("Child Contract Functionality", function () {
        it("Should preserve balance after deployment", async function () {
            const tx = await factory.deployWithCreate("BalanceTest", { value: ethers.parseEther("5") });
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => log.fragment.name === "Deployed");
            const childAddress = event.args[0];
            
            const child = await ethers.getContractAt("contracts/task1/ChildContract.sol:ChildContract", childAddress);
            const balance = await child.getBalance();
            
            expect(ethers.formatEther(balance)).to.equal("5.0");
            console.log(`\nChild contract balance: ${ethers.formatEther(balance)} ETH`);
        });
    });
});