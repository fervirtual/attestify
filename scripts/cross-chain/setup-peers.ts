import { network } from "hardhat";

const SEPOLIA_RELAY = "0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E";
const ARBITRUM_SEPOLIA_RELAY = "0xA73EB3aAcE334FFF3b910AdF40AbFF4bB25E93dD";
const ARBITRUM_SEPOLIA_EID = 40231;
const SEPOLIA_EID = 40161;

async function setPeerOnSepolia() {
  const { ethers } = await network.getOrCreate({ network: "sepolia" });
  const relay = await ethers.getContractAt("CrossChainRelay", SEPOLIA_RELAY);

  const peerBytes32 = ethers.zeroPadValue(ARBITRUM_SEPOLIA_RELAY, 32);
  const tx = await relay.setPeer(ARBITRUM_SEPOLIA_EID, peerBytes32);
  await tx.wait();
  console.log("Peer configurado en Sepolia, apuntando a Arbitrum Sepolia");
}

async function setPeerOnArbitrum() {
  const { ethers } = await network.getOrCreate({ network: "arbitrumSepolia" });
  const relay = await ethers.getContractAt("CrossChainRelay", ARBITRUM_SEPOLIA_RELAY);

  const peerBytes32 = ethers.zeroPadValue(SEPOLIA_RELAY, 32);
  const tx = await relay.setPeer(SEPOLIA_EID, peerBytes32);
  await tx.wait();
  console.log("Peer configurado en Arbitrum Sepolia, apuntando a Sepolia");
}

await setPeerOnSepolia();
await setPeerOnArbitrum();
console.log("Listo, ambos peers configurados.");