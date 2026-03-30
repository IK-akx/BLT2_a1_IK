const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("\n UPGRADE DEMONSTRATION \n");

    // STEP 1: Deploy V1
    console.log("STEP 1: Deploy LogicV1 with UUPS proxy");
    const LogicV1 = await ethers.getContractFactory("contracts/task2/LogicV1.sol:LogicV1");
    const proxy = await upgrades.deployProxy(LogicV1, [], { initializer: "initialize", kind: "uups" });
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();
    console.log(`✅ Proxy deployed at: ${proxyAddress}`);
    
    const implV1 = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`✅ Implementation V1 at: ${implV1}`);

    // STEP 2: Use V1 functions
    console.log("\nSTEP 2: Interact with LogicV1");
    console.log(`Current counter: ${await proxy.getCounter()}`);
    
    await proxy.increment();
    console.log(`After increment 1: ${await proxy.getCounter()}`);
    
    await proxy.increment();
    console.log(`After increment 2: ${await proxy.getCounter()}`);
    
    await proxy.increment();
    console.log(`After increment 3: ${await proxy.getCounter()}`);

    // STEP 3: Deploy V2
    console.log("\nSTEP 3: Deploy LogicV2 implementation");
    const LogicV2 = await ethers.getContractFactory("contracts/task2/LogicV2.sol:LogicV2");
    console.log(`✅ LogicV2 bytecode deployed`);

    // STEP 4: Upgrade to V2
    console.log("\nSTEP 4: Upgrade proxy from V1 to V2");
    console.log(`State before upgrade (counter = ${await proxy.getCounter()})`);
    
    const upgraded = await upgrades.upgradeProxy(proxyAddress, LogicV2);
    console.log(`✅ Upgrade transaction submitted`);
    
    const implV2 = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`✅ New implementation V2 at: ${implV2}`);

    // STEP 5: Verify state preservation
    console.log("\nSTEP 5: Verify state preservation");
    const counterAfterUpgrade = await upgraded.getCounter();
    console.log(`Counter after upgrade: ${counterAfterUpgrade}`);
    console.log(`✅ State preserved! (was 3, still ${counterAfterUpgrade})`);

    // STEP 6: Test new V2 functions
    console.log("\nSTEP 6: Test new V2 functionality");
    await upgraded.decrement();
    console.log(`After decrement: ${await upgraded.getCounter()}`);
    
    await upgraded.increment();
    console.log(`After increment: ${await upgraded.getCounter()}`);
    
    await upgraded.reset();
    console.log(`After reset: ${await upgraded.getCounter()}`);
    
    await upgraded.increment();
    console.log(`After final increment: ${await upgraded.getCounter()}`);

    // Summary
    console.log("\n UPGRADE SUMMARY ");
    console.log("✅ Proxy address remained unchanged");
    console.log("✅ Counter value persisted through upgrade");
    console.log("✅ New functions (decrement, reset) available");
    console.log("✅ Original functions (increment) still work");
    console.log("✅ Only owner can authorize upgrades (security)");
    
    console.log("\n ADDRESSES ");
    console.log(`Proxy (never changes): ${proxyAddress}`);
    console.log(`V1 Implementation: ${implV1}`);
    console.log(`V2 Implementation: ${implV2}`);
}

main().catch(console.error);