# Deployment en Sepolia (testnet)

## Direcciones de contratos

| Contrato | Direccion |
|---|---|
| FeeCollector | `0x58E479C35B9AC516A843165ae55AAdeb4de1f421` |
| AttestationCore | `0x8b0783CcC1b6118bcaC084e7f2dD011D590bDe03` |
| CrossChainRelay | `0xA73EB3aAcE334FFF3b910AdF40AbFF4bB25E93dD` |

## Configuracion del deployment

- Red: Ethereum Sepolia (Chain ID 11155111)
- Fee inicial de FeeCollector: 0.000001 ETH
- Treasury inicial: cuenta de deploy
- Endpoint de LayerZero usado (CrossChainRelay): `0x6EDCE65403992e310A62460808c4b910D972f10f`
  (fuente: https://docs.layerzero.network/v2/deployments/deployed-contracts)

## Validacion end-to-end

Se confirmo el flujo completo contra estos contratos ya desplegados:
emision de una attestation real (pagando el fee vigente), y verificacion
de que el contrato la reconoce como valida (`isValid() == true`).
Script usado: `scripts/test-e2e-sepolia.ts`.

## Pendiente

- Verificar los contratos en Sepolia Etherscan (publicar el codigo
  fuente para que sea auditable publicamente desde el explorador).
- No se probo todavia el envio real de un mensaje cross-chain via
  CrossChainRelay (ver docs/adr/0003-limitacion-layerzero-hardhat3.md
  para el contexto de esa limitacion).
