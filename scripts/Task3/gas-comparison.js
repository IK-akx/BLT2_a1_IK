const hre = require("hardhat");

async function main() {
    console.log("\n GAS OPTIMIZATION COMPARISON \n");
    
    const Unoptimized = await hre.ethers.getContractFactory("contracts/task3/Unoptimized.sol:Unoptimized");
    const unoptimized = await Unoptimized.deploy();
    await unoptimized.waitForDeployment();
    
    const Optimized = await hre.ethers.getContractFactory("contracts/task3/Optimized.sol:Optimized");
    const optimized = await Optimized.deploy();
    await optimized.waitForDeployment();
    
    const results = [];
    
    // Test 1: addMultipleValues with 5 items
    const values = [10, 20, 30, 40, 50];
    
    let tx = await unoptimized.addMultipleValues(values);
    let receipt = await tx.wait();
    let unoptGas = Number(receipt.gasUsed);
    
    tx = await optimized.addMultipleValues(values);
    receipt = await tx.wait();
    let optGas = Number(receipt.gasUsed);
    
    results.push({
        operation: "addMultipleValues (5 items)",
        unoptimized: unoptGas,
        optimized: optGas,
        saved: unoptGas - optGas,
        percent: ((unoptGas - optGas) * 100 / unoptGas).toFixed(2)
    });
    
    // Test 2: updateBalance (deposit)
    tx = await unoptimized.updateBalance(100, true);
    receipt = await tx.wait();
    unoptGas = Number(receipt.gasUsed);
    
    tx = await optimized.updateBalance(100, true);
    receipt = await tx.wait();
    optGas = Number(receipt.gasUsed);
    
    results.push({
        operation: "updateBalance (deposit)",
        unoptimized: unoptGas,
        optimized: optGas,
        saved: unoptGas - optGas,
        percent: ((unoptGas - optGas) * 100 / unoptGas).toFixed(2)
    });
    
    // Test 3: updateBalance (withdraw)
    await unoptimized.updateBalance(200, true);
    await optimized.updateBalance(200, true);
    
    tx = await unoptimized.updateBalance(100, false);
    receipt = await tx.wait();
    unoptGas = Number(receipt.gasUsed);
    
    tx = await optimized.updateBalance(100, false);
    receipt = await tx.wait();
    optGas = Number(receipt.gasUsed);
    
    results.push({
        operation: "updateBalance (withdraw)",
        unoptimized: unoptGas,
        optimized: optGas,
        saved: unoptGas - optGas,
        percent: ((unoptGas - optGas) * 100 / unoptGas).toFixed(2)
    });
    
    // Test 4: incrementCounters
    tx = await unoptimized.incrementCounters();
    receipt = await tx.wait();
    unoptGas = Number(receipt.gasUsed);
    
    tx = await optimized.incrementCounters();
    receipt = await tx.wait();
    optGas = Number(receipt.gasUsed);
    
    results.push({
        operation: "incrementCounters",
        unoptimized: unoptGas,
        optimized: optGas,
        saved: unoptGas - optGas,
        percent: ((unoptGas - optGas) * 100 / unoptGas).toFixed(2)
    });
    
    // Summary Table
    console.log("\n GAS COMPARISON RESULTS \n");
    console.log("| Operation                          | Unoptimized | Optimized | Saved     | % Saved |");
    console.log("|------------------------------------|-------------|-----------|-----------|---------|");
    
    for (const r of results) {
        const op = r.operation.padEnd(34);
        const unopt = String(r.unoptimized).padEnd(11);
        const opt = String(r.optimized).padEnd(9);
        const saved = String(r.saved).padEnd(9);
        const pct = String(r.percent).padEnd(6);
        console.log(`| ${op} | ${unopt} | ${opt} | ${saved} | ${pct}% |`);
    }
    
    // Total savings
    const totalUnopt = results.reduce((sum, r) => sum + r.unoptimized, 0);
    const totalOpt = results.reduce((sum, r) => sum + r.optimized, 0);
    const totalSaved = totalUnopt - totalOpt;
    const totalPercent = (totalSaved * 100 / totalUnopt).toFixed(2);
    
    console.log("\n|------------------------------------|-------------|-----------|-----------|---------|");
    console.log(`| TOTAL                              | ${String(totalUnopt).padEnd(11)} | ${String(totalOpt).padEnd(9)} | ${String(totalSaved).padEnd(9)} | ${totalPercent.padEnd(6)}% |`);
    
    console.log("\n OPTIMIZATION SUMMARY TABLE \n");
    console.log("| # | Optimization          | Category              | Est. Saved | Explanation |");
    console.log("|---|----------------------|----------------------|------------|-------------|");
    console.log("| 1 | Storage packing       | Storage Packing       | ~5,000     | Grouped bools and address into 1 slot |");
    console.log("| 2 | Constant keyword      | Immutable/Constant    | ~2,000     | DEAD_ADDRESS stored in bytecode |");
    console.log("| 3 | Calldata vs Memory    | Calldata              | ~3,000     | Use calldata for read-only arrays |");
    console.log("| 4 | Short-circuiting      | Condition Order       | ~500       | Cheapest checks first |");
    console.log("| 5 | Unchecked arithmetic  | Unchecked Blocks      | ~1,500     | Loop counter and increments |");
    console.log("| 6 | Caching storage reads | Storage Caching       | ~4,000     | Cache values array reference |");
    console.log("| 7 | Event-based logging   | Events                | ~2,500     | Replaced storage write with event |");
    console.log("|   | **TOTAL**             |                      | **~18,500** | **~30-40% reduction** |");
}

main().catch(console.error);