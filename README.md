# Attestify

Framework para credenciales y attestations verificables, interoperable
entre blockchains.

## Estado del proyecto

En etapa de diseño inicial. Aún no hay código funcional publicado.

## Arquitectura

- Red base: Ethereum mainnet + L2s (Arbitrum, Optimism)
- Mensajería cross-chain: LayerZero
- Extensión futura planeada: Solana vía Wormhole

Ver el detalle de esta decisión en [`docs/adr/0001-arquitectura-base.md`](docs/adr/0001-arquitectura-base.md).

## Licencia

Apache 2.0. Ver [`LICENSE`](LICENSE).
