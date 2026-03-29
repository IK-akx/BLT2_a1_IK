const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Task 2: UUPS Proxy Pattern", function () {
    let logicV1, logicV2, proxy;
    let owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        
        const LogicV1 = await ethers.getContractFactory("contracts/task2/LogicV1.sol:LogicV1");
        logicV1 = await upgrades.deployProxy(LogicV1, [], {
            initializer: "initialize",
            kind: "uups"
        });
        await logicV1.waitForDeployment();
    });

    describe("Initial Deployment (V1)", function () {
        it("Should initialize with counter = 0", async function () {
            expect(await logicV1.getCounter()).to.equal(0);
        });

        it("Should increment counter correctly", async function () {
            await logicV1.increment();
            expect(await logicV1.getCounter()).to.equal(1);
            await logicV1.increment();
            expect(await logicV1.getCounter()).to.equal(2);
        });

        it("Should have correct owner", async function () {
            expect(await logicV1.owner()).to.equal(owner.address);
        });
    });

    describe("Upgrade to V2", function () {
        beforeEach(async function () {
            await logicV1.increment();
            await logicV1.increment();
            await logicV1.increment();
            expect(await logicV1.getCounter()).to.equal(3);
            
            const LogicV2 = await ethers.getContractFactory("contracts/task2/LogicV2.sol:LogicV2");
            logicV2 = await upgrades.upgradeProxy(await logicV1.getAddress(), LogicV2);
        });

        it("Should preserve counter value after upgrade", async function () {
            expect(await logicV2.getCounter()).to.equal(3);
        });

        it("Should have new V2 functionality (decrement)", async function () {
            await logicV2.decrement();
            expect(await logicV2.getCounter()).to.equal(2);
        });

        it("Should have new V2 functionality (reset)", async function () {
            await logicV2.reset();
            expect(await logicV2.getCounter()).to.equal(0);
        });

        it("Should still support V1 functions", async function () {
            await logicV2.increment();
            expect(await logicV2.getCounter()).to.equal(4);
        });

        it("Should prevent non-owner from upgrading", async function () {
            const LogicV2 = await ethers.getContractFactory("contracts/task2/LogicV2.sol:LogicV2");
            const proxyAddress = await logicV1.getAddress();
            
            // Try to upgrade using the proxy contract directly with non-owner
            const proxyContract = await ethers.getContractAt("LogicV1", proxyAddress, addr1);
            
            // Get the implementation address of V2
            const logicV2Impl = await LogicV2.deploy();
            await logicV2Impl.waitForDeployment();
            const v2Address = await logicV2Impl.getAddress();
            
            // Non-owner trying to upgrade should fail
            await expect(
                proxyContract.upgradeTo(v2Address)
            ).to.be.rejected;
        });
    });

    describe("Storage Layout Verification", function () {
        it("Should maintain storage integrity after multiple upgrades", async function () {
            await logicV1.increment();
            await logicV1.increment();
            expect(await logicV1.getCounter()).to.equal(2);
            
            const LogicV2 = await ethers.getContractFactory("contracts/task2/LogicV2.sol:LogicV2");
            logicV2 = await upgrades.upgradeProxy(await logicV1.getAddress(), LogicV2);
            
            expect(await logicV2.getCounter()).to.equal(2);
            await logicV2.decrement();
            expect(await logicV2.getCounter()).to.equal(1);
            
            const logicV2Again = await upgrades.upgradeProxy(await logicV1.getAddress(), LogicV2);
            expect(await logicV2Again.getCounter()).to.equal(1);
        });
    });
});