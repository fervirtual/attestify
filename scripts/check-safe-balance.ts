import { network } from "hardhat";

const SAFE_ADDRESS = "0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760";

const { ethers } = await network.getOrCreate({ network: "sepolia" });

const balance = await ethers.provider.getBalance(SAFE_ADDRESS);
console.log("Balance de la Safe:", ethers.formatEther(balance), "ETH");