import { network } from "hardhat";

const ATTESTATION_CORE_ADDRESS = "0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4";
const FEE_COLLECTOR_ADDRESS = "0xFd6e2f8e06C007688CDB861688a631165E4c8525";

const { ethers } = await network.getOrCreate({ network: "sepolia" });

const [signer] = await ethers.getSigners();
console.log("Usando cuenta:", signer.address);

const feeCollector = await ethers.getContractAt(
  "FeeCollector",
  FEE_COLLECTOR_ADDRESS
);
const fee = await feeCollector.fee();
console.log("Fee vigente:", ethers.formatEther(fee), "ETH");

const attestationCore = await ethers.getContractAt(
  "AttestationCore",
  ATTESTATION_CORE_ADDRESS
);

const schema = "0x0000000000000000000000000000000000000000000000000000000000000001";
const data = "0x74657374"; // "test" en hex

console.log("Emitiendo attestation de prueba...");
const tx = await attestationCore.issueAttestation(
  schema,
  signer.address,
  0,
  true,
  data,
  { value: fee }
);
const receipt = await tx.wait();
console.log("Transaccion confirmada:", receipt?.hash);

const event = receipt?.logs
  .map((log) => {
    try {
      return attestationCore.interface.parseLog(log as never);
    } catch {
      return null;
    }
  })
  .find((e) => e?.name === "AttestationIssued");

if (event) {
  const uid = event.args.uid as string;
  console.log("Attestation creada, uid:", uid);

  const isValid = await attestationCore.isValid(uid);
  console.log("Es valida:", isValid);
} else {
  console.log("No se encontro el evento AttestationIssued.");
}