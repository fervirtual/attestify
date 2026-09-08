import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Direccion oficial del Endpoint V2 de LayerZero en Ethereum Sepolia.
// Fuente: https://docs.layerzero.network/v2/deployments/deployed-contracts
const SEPOLIA_LZ_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";

// Fee inicial: 0.000001 ETH (mismo valor usado en los tests locales).
const INITIAL_FEE = 1_000_000_000_000n;

export default buildModule("AttestifyModule", (m) => {
  const deployer = m.getAccount(0);

  // 1. FeeCollector: el deployer es tambien la treasury inicial.
  const feeCollector = m.contract("FeeCollector", [INITIAL_FEE, deployer]);

  // 2. AttestationCore: conectado al FeeCollector recien desplegado.
  const attestationCore = m.contract("AttestationCore", [feeCollector]);

  // 3. CrossChainRelay: conectado al Endpoint real de LayerZero en Sepolia.
  const crossChainRelay = m.contract("CrossChainRelay", [
    SEPOLIA_LZ_ENDPOINT,
    deployer,
  ]);

  return { feeCollector, attestationCore, crossChainRelay };
});
