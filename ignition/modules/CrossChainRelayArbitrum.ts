import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Mismo Endpoint V2 que en Sepolia (LayerZero usa CREATE2,
// la misma direccion existe en ambas redes).
const ARBITRUM_SEPOLIA_LZ_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";

export default buildModule("CrossChainRelayArbitrumModule", (m) => {
  const deployer = m.getAccount(0);

  const crossChainRelay = m.contract("CrossChainRelay", [
    ARBITRUM_SEPOLIA_LZ_ENDPOINT,
    deployer,
  ]);

  return { crossChainRelay };
});