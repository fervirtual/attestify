import { network } from "hardhat";

const SIGNER_ADDRESS = "0x5bDF50f0E929E1d4f22594E21EbE2a6b497b4Db5";
const AMOUNT_ETH = "0.005"; // suficiente para cubrir el fee de activacion de la Safe

const { ethers } = await network.getOrCreate({ network: "sepolia" });
const [signer] = await ethers.getSigners();

console.log("Enviando desde:", signer.address);
console.log("Hacia el firmante:", SIGNER_ADDRESS);

const tx = await signer.sendTransaction({
  to: SIGNER_ADDRESS,
  value: ethers.parseEther(AMOUNT_ETH),
});
await tx.wait();

console.log("Transaccion confirmada:", tx.hash);

const balance = await ethers.provider.getBalance(SIGNER_ADDRESS);
console.log("Balance del firmante:", ethers.formatEther(balance), "ETH");