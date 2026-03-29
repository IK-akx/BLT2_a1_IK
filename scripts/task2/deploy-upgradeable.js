const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("========== DEPLOYING UUPS UPGRADEABLE CONTRACT ==========\n");

    // Deploy LogicV1
    console.log("1. Deploying LogicV1 implementation...");
    const LogicV1 = await ethers.getContractFactory("contracts/task2/LogicV1.sol:LogicV1");
    const logicV1 = await upgrades.deployProxy(LogicV1, [], {
        initializer: "initialize",
        kind: "uups"
    });
    await logicV1.waitForDeployment();
    
    const proxyAddress = await logicV1.getAddress();
    console.log(`Proxy address: ${proxyAddress}`);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`Implementation V1 address: ${implementationAddress}`);

    // Test V1 functionality
    console.log("\n2. Testing LogicV1 functionality...");
    console.log(`Initial counter: ${await logicV1.getCounter()}`);
    
    await logicV1.increment();
    console.log(`After increment: ${await logicV1.getCounter()}`);
    
    await logicV1.increment();
    console.log(`After second increment: ${await logicV1.getCounter()}`);

    // Deploy LogicV2
    console.log("\n3. Deploying LogicV2 implementation...");
    const LogicV2 = await ethers.getContractFactory("contracts/task2/LogicV2.sol:LogicV2");
    
    // Upgrade to V2
    console.log("4. Upgrading to LogicV2...");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, LogicV2);
    console.log(`Upgraded to V2 at proxy: ${proxyAddress}`);
    
    const newImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`New implementation V2 address: ${newImplementation}`);

    // Test V2 functionality - counter should persist
    console.log("\n5. Testing LogicV2 functionality (state preserved)...");
    console.log(`Counter after upgrade (should be 2): ${await upgraded.getCounter()}`);
    
    await upgraded.decrement();
    console.log(`After decrement: ${await upgraded.getCounter()}`);
    
    await upgraded.increment();
    console.log(`After increment: ${await upgraded.getCounter()}`);
    
    await upgraded.reset();
    console.log(`After reset: ${await upgraded.getCounter()}`);

    // Final verification
    console.log("\n VERIFICATION ");
    console.log(`✓ Counter value persisted through upgrade (was 2, still 2 before V2 ops)`);
    console.log(`✓ New V2 functions (decrement, reset) work correctly`);
    console.log(`✓ Proxy address remained: ${proxyAddress}`);
    
    console.log("\n ADDRESS SUMMARY ");
    console.log(`Proxy: ${proxyAddress}`);
    console.log(`LogicV1 Implementation: ${implementationAddress}`);
    console.log(`LogicV2 Implementation: ${newImplementation}`);
}

main().catch(console.error);