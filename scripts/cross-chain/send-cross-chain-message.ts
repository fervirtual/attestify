import { network } from "hardhat";

const SEPOLIA_RELAY = "0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E";
const ARBITRUM_SEPOLIA_EID = 40231;

const { ethers } = await network.getOrCreate({ network: "sepolia" });
const [signer] = await ethers.getSigners();

const relay = await ethers.getContractAt("CrossChainRelay", SEPOLIA_RELAY);

const schema = "0x0000000000000000000000000000000000000000000000000000000000000001";
const uid = "0x0000000000000000000000000000000000000000000000000000000000000099";

// Opciones de ejecucion minimas requeridas por LayerZero (gas para el mensaje en destino).
const options = "0x0003010011010000000000000000000000000000ea60";

console.log("Consultando el fee de LayerZero...");
const fee = await relay.quoteNotify(
  ARBITRUM_SEPOLIA_EID,
  uid,
  schema,
  signer.address,
  signer.address,
  options
);
console.log("Fee estimado:", ethers.formatEther(fee.nativeFee), "ETH");

console.log("Enviando mensaje cross-chain...");
const tx = await relay.notifyAttestation(
  ARBITRUM_SEPOLIA_EID,
  uid,
  schema,
  signer.address,
  signer.address,
  options,
  { value: fee.nativeFee }
);
const receipt = await tx.wait();
console.log("Transaccion confirmada en Sepolia:", receipt?.hash);
console.log("Podes rastrear la entrega en: https://layerzeroscan.com/tx/" + receipt?.hash);