import { network } from "hardhat";
import * as readline from "node:readline/promises";

const FEE_COLLECTOR_ADDRESS = "0xFd6e2f8e06C007688CDB861688a631165E4c8525";
const TARGET_USD = 0.05; // cuanto queremos que valga el fee en dolares

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const answer = await rl.question("Precio actual de ETH en USD (ej: 2438.42): ");
rl.close();

const ethPriceUsd = parseFloat(answer);
if (isNaN(ethPriceUsd) || ethPriceUsd <= 0) {
  throw new Error("Precio invalido");
}

const newFee = BigInt(Math.round((TARGET_USD / ethPriceUsd) * 1e18));

const { ethers } = await network.getOrCreate({ network: "sepolia" });
const feeCollector = await ethers.getContractAt("FeeCollector", FEE_COLLECTOR_ADDRESS);

const oldFee = await feeCollector.fee();
console.log("Fee anterior:", ethers.formatEther(oldFee), "ETH");
console.log("Fee nuevo calculado:", ethers.formatEther(newFee), "ETH (~$" + TARGET_USD + " a $" + ethPriceUsd + "/ETH)");

const tx = await feeCollector.setFee(newFee);
await tx.wait();

const confirmedFee = await feeCollector.fee();
console.log("Fee confirmado on-chain:", ethers.formatEther(confirmedFee), "ETH");
console.log("Transaccion:", tx.hash);