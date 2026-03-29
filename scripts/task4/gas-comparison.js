const hre = require("hardhat");

async function main() {
    console.log("\n========== ASSEMBLY vs SOLIDITY GAS COMPARISON ==========\n");
    
    const Assembly = await hre.ethers.getContractFactory("contracts/task4/AssemblyContract.sol:AssemblyContract");
    const assembly = await Assembly.deploy();
    await assembly.waitForDeployment();
    
    const Solidity = await hre.ethers.getContractFactory("contracts/task4/SolidityOnly.sol:SolidityOnly");
    const solidity = await Solidity.deploy();
    await solidity.waitForDeployment();
    
    const results = [];
    
    // Test 1: setValue (this IS a transaction)
    console.log("Testing setValue...");
    let tx = await solidity.setValue(12345);
    let receipt = await tx.wait();
    let solidityGas = Number(receipt.gasUsed);
    
    tx = await assembly.setValueAssembly(12345);
    receipt = await tx.wait();
    let assemblyGas = Number(receipt.gasUsed);
    
    results.push({
        operation: "setValue (storage write)",
        solidity: solidityGas,
        assembly: assemblyGas,
        saved: solidityGas - assemblyGas,
        percent: ((solidityGas - assemblyGas) * 100 / solidityGas).toFixed(2)
    });
    
    // Test 2: getValue (view function - use estimateGas)
    console.log("Testing getValue...");
    await solidity.setValue(100);
    await assembly.setValueAssembly(100);
    
    const solidityGas2 = await solidity.getValue.estimateGas();
    const assemblyGas2 = await assembly.getValueAssembly.estimateGas();
    
    results.push({
        operation: "getValue (storage read)",
        solidity: Number(solidityGas2),
        assembly: Number(assemblyGas2),
        saved: Number(solidityGas2) - Number(assemblyGas2),
        percent: ((Number(solidityGas2) - Number(assemblyGas2)) * 100 / Number(solidityGas2)).toFixed(2)
    });
    
    // Test 3: isPowerOfTwo (pure function - use estimateGas)
    console.log("Testing isPowerOfTwo...");
    const solidityGas3 = await solidity.isPowerOfTwo.estimateGas(64);
    const assemblyGas3 = await assembly.isPowerOfTwoAssembly.estimateGas(64);
    
    results.push({
        operation: "isPowerOfTwo (arithmetic)",
        solidity: Number(solidityGas3),
        assembly: Number(assemblyGas3),
        saved: Number(solidityGas3) - Number(assemblyGas3),
        percent: ((Number(solidityGas3) - Number(assemblyGas3)) * 100 / Number(solidityGas3)).toFixed(2)
    });
    
    // Results table
    console.log("\n========== GAS COMPARISON RESULTS ==========\n");
    console.log("| Operation                      | Solidity | Assembly | Saved   | % Saved |");
    console.log("|--------------------------------|----------|----------|---------|---------|");
    
    for (const r of results) {
        const op = r.operation.padEnd(30);
        const sol = String(r.solidity).padEnd(8);
        const asm = String(r.assembly).padEnd(8);
        const saved = String(r.saved).padEnd(7);
        const pct = String(r.percent).padEnd(6);
        console.log(`| ${op} | ${sol} | ${asm} | ${saved} | ${pct}% |`);
    }
    
    const totalSolidity = results.reduce((sum, r) => sum + r.solidity, 0);
    const totalAssembly = results.reduce((sum, r) => sum + r.assembly, 0);
    const totalSaved = totalSolidity - totalAssembly;
    
    console.log("|--------------------------------|----------|----------|---------|---------|");
    console.log(`| TOTAL                          | ${String(totalSolidity).padEnd(8)} | ${String(totalAssembly).padEnd(8)} | ${String(totalSaved).padEnd(7)} | ${((totalSaved * 100) / totalSolidity).toFixed(2)}% |`);
    
    console.log("\n========== THREE ASSEMBLY OPERATIONS DEMONSTRATED ==========\n");
    console.log("1. caller() - Read msg.sender directly from context");
    console.log("2. and() + sub() - Efficient power-of-2 check using bitwise AND");
    console.log("3. sload() / sstore() - Direct storage slot access\n");
}

main().catch(console.error);