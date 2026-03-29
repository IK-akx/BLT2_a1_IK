const hre = require("hardhat");

async function main() {
    console.log("\n Gas Comparison: CREATE vs CREATE2 \n");
    
    const Factory = await hre.ethers.getContractFactory("contracts/task1/Factory.sol:Factory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    
    const createGas = [];
    const create2Gas = [];
    
    // Run 3 deployments each for accurate comparison
    for (let i = 0; i < 3; i++) {
        // CREATE
        const createTx = await factory.deployWithCreate(`Test_${i}`, { value: hre.ethers.parseEther("1") });
        const createReceipt = await createTx.wait();
        createGas.push(createReceipt.gasUsed);
        
        // CREATE2
        const salt = hre.ethers.encodeBytes32String(`salt_${i}`);
        const create2Tx = await factory.deployWithCreate2(`Test2_${i}`, salt, { value: hre.ethers.parseEther("1") });
        const create2Receipt = await create2Tx.wait();
        create2Gas.push(create2Receipt.gasUsed);
    }
    
    const avgCreate = createGas.reduce((a, b) => a + b, 0n) / 3n;
    const avgCreate2 = create2Gas.reduce((a, b) => a + b, 0n) / 3n;
    
    console.log("CREATE gas costs:", createGas.map(g => g.toString()));
    console.log("CREATE2 gas costs:", create2Gas.map(g => g.toString()));
    console.log(`\nAverage CREATE gas: ${avgCreate.toString()}`);
    console.log(`Average CREATE2 gas: ${avgCreate2.toString()}`);
    console.log(`Difference: ${(avgCreate - avgCreate2).toString()} gas`);
    console.log(`CREATE2 is ${((Number(avgCreate - avgCreate2) / Number(avgCreate)) * 100).toFixed(2)}% cheaper`);
    
    console.log("\n TABLE ");
    console.log("| Method | Average Gas | Advantage          |");
    console.log("|--------|-------------|--------------------|");
    console.log(`| CREATE | ${avgCreate.toString().padEnd(9)} |                    |`);
    console.log(`| CREATE2| ${avgCreate2.toString().padEnd(9)} | ${((Number(avgCreate - avgCreate2) / Number(avgCreate)) * 100).toFixed(2)}% cheaper |`);
}

main().catch(console.error);