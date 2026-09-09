# Deployment en Arbitrum Sepolia (testnet)

## Proposito

Este deployment es puntual, para validar el flujo cross-chain real de
CrossChainRelay junto con el deployment de Sepolia (ver
docs/guides/cross-chain-testing.md). No incluye FeeCollector ni
AttestationCore, ya que no son necesarios para esta prueba.

## Direccion del contrato

| Contrato | Direccion |
|---|---|
| CrossChainRelay | `0xA73EB3aAcE334FFF3b910AdF40AbFF4bB25E93dD` |

## Configuracion del deployment

- Red: Arbitrum Sepolia (Chain ID 421614)
- Endpoint de LayerZero usado: `0x6EDCE65403992e310A62460808c4b910D972f10f`
  (misma direccion que en Sepolia, ver nota tecnica en
  docs/guides/cross-chain-testing.md)
- Peer configurado: apunta al CrossChainRelay de Sepolia
  (`0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E`)

## Validacion

Se confirmo la recepcion real de un mensaje enviado desde Sepolia -
ver el detalle completo en docs/guides/cross-chain-testing.md.

## Pendiente

- No verificado en Arbiscan/Blockscout (no era prioridad para esta
  prueba puntual de mensajeria).
- No se desplegaron FeeCollector ni AttestationCore en esta red.