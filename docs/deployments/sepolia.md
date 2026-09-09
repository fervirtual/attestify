# Deployment en Sepolia (testnet)

## Direcciones de contratos (verificadas en Etherscan, Blockscout y Sourcify)

| Contrato | Direccion | Verificacion |
|---|---|---|
| FeeCollector | `0xFd6e2f8e06C007688CDB861688a631165E4c8525` | [Etherscan](https://sepolia.etherscan.io/address/0xFd6e2f8e06C007688CDB861688a631165E4c8525#code) · [Blockscout](https://eth-sepolia.blockscout.com/address/0xFd6e2f8e06C007688CDB861688a631165E4c8525#code) |
| AttestationCore | `0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4` | [Etherscan](https://sepolia.etherscan.io/address/0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4#code) · [Blockscout](https://eth-sepolia.blockscout.com/address/0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4#code) |
| CrossChainRelay | `0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E` | [Etherscan](https://sepolia.etherscan.io/address/0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E#code) · [Blockscout](https://eth-sepolia.blockscout.com/address/0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E#code) |

## Configuracion del deployment

- Red: Ethereum Sepolia (Chain ID 11155111)
- Perfil de compilacion: `production` (optimizador habilitado, 200 runs)
- Fee inicial de FeeCollector: 0.000001 ETH
- Treasury inicial: cuenta de deploy
- Endpoint de LayerZero usado (CrossChainRelay): `0x6EDCE65403992e310A62460808c4b910D972f10f`
  (fuente: https://docs.layerzero.network/v2/deployments/deployed-contracts)

## Nota sobre verificacion

El deploy debe hacerse y verificarse usando el mismo perfil de
compilacion (`production`), y sin correr otros comandos de Hardhat
(como `hardhat run`) entre el compile y el verify, ya que eso puede
resetear el perfil activo a `default` y causar un desajuste de
bytecode entre lo desplegado y lo verificado.

## Validacion end-to-end

Se confirmo el flujo completo contra los contratos desplegados:
emision de una attestation real (pagando el fee vigente), y verificacion
de que el contrato la reconoce como valida (`isValid() == true`).
Script usado: `scripts/test-e2e-sepolia.ts`.

## Pendiente

- No se probo todavia el envio real de un mensaje cross-chain via
  CrossChainRelay entre dos redes distintas (ver
  docs/adr/0003-limitacion-layerzero-hardhat3.md para el contexto).
