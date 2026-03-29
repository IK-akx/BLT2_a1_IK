const hre = require("hardhat");

async function main() {
    console.log("Deploying Factory");
    
    const Factory = await hre.ethers.getContractFactory("contracts/task1/Factory.sol:Factory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log(`Factory deployed to: ${factoryAddress}`);
    
    // Test CREATE
    console.log("\n Deploying with CREATE");
    const createTx = await factory.deployWithCreate("Child1", { value: hre.ethers.parseEther("1") });
    const createReceipt = await createTx.wait();
    const createEvent = createReceipt.logs.find(log => log.fragment?.name === "Deployed");
    console.log(`Child address: ${createEvent.args[0]}`);
    console.log(`Gas used: ${createReceipt.gasUsed}`);
    
    // Test CREATE2
    console.log("\n Deploying with CREATE2");
    const salt = hre.ethers.encodeBytes32String("my_salt");
    const create2Tx = await factory.deployWithCreate2("Child2", salt, { value: hre.ethers.parseEther("1") });
    const create2Receipt = await create2Tx.wait();
    const create2Event = create2Receipt.logs.find(log => log.fragment?.name === "Deployed");
    console.log(`Child address: ${create2Event.args[0]}`);
    console.log(`Gas used: ${create2Receipt.gasUsed}`);
    
    // Get all deployed contracts
    const contracts = await factory.getDeployedContracts();
    console.log(`\nTotal deployed contracts: ${contracts.length}`);
    console.log("Addresses:", contracts);
}

main().catch(console.error);