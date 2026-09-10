# Arbitrum Sepolia deployment (testnet)

*[Versión en español](../../deployments/arbitrum-sepolia.md)*

## Purpose

This deployment is a one-off, meant to validate CrossChainRelay's
real cross-chain flow together with the Sepolia deployment (see
docs/en/guides/cross-chain-testing.md). It doesn't include
FeeCollector or AttestationCore, since they aren't needed for this
test.

## Contract address

| Contract | Address |
|---|---|
| CrossChainRelay | `0xA73EB3aAcE334FFF3b910AdF40AbFF4bB25E93dD` |

## Deployment configuration

- Network: Arbitrum Sepolia (Chain ID 421614)
- LayerZero endpoint used: `0x6EDCE65403992e310A62460808c4b910D972f10f`
  (same address as on Sepolia, see technical note in
  docs/en/guides/cross-chain-testing.md)
- Peer configured: points to Sepolia's CrossChainRelay
  (`0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E`)

## Validation

Real receipt of a message sent from Sepolia was confirmed - see the
full detail in docs/en/guides/cross-chain-testing.md.

## Pending

- Not verified on Arbiscan/Blockscout (not a priority for this
  one-off messaging test).
- FeeCollector and AttestationCore were not deployed on this network.