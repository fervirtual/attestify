import { network } from "hardhat";

const SAFE_ADDRESS = "0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760";
const AMOUNT_ETH = "0.005"; // suficiente para cubrir el fee de activacion + alguna operacion

const { ethers } = await network.getOrCreate({ network: "sepolia" });
const [signer] = await ethers.getSigners();

console.log("Enviando desde:", signer.address);
console.log("Hacia la Safe:", SAFE_ADDRESS);

const tx = await signer.sendTransaction({
  to: SAFE_ADDRESS,
  value: ethers.parseEther(AMOUNT_ETH),
});
await tx.wait();

console.log("Transaccion confirmada:", tx.hash);

const balance = await ethers.provider.getBalance(SAFE_ADDRESS);
console.log("Balance de la Safe:", ethers.formatEther(balance), "ETH");