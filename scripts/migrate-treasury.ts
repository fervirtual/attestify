import { network } from "hardhat";

const FEE_COLLECTOR_ADDRESS = "0xFd6e2f8e06C007688CDB861688a631165E4c8525";
const SAFE_ADDRESS = "0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760";

const { ethers } = await network.getOrCreate({ network: "sepolia" });

const feeCollector = await ethers.getContractAt("FeeCollector", FEE_COLLECTOR_ADDRESS);

const oldTreasury = await feeCollector.treasury();
console.log("Treasury anterior:", oldTreasury);

const tx = await feeCollector.setTreasury(SAFE_ADDRESS);
await tx.wait();

const newTreasury = await feeCollector.treasury();
console.log("Treasury nueva:", newTreasury);
console.log("Transaccion:", tx.hash);