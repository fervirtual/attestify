# Attestify

Framework de credenciales y attestations verificables, interoperable
entre blockchains. Emití, verificá y revocá credenciales on-chain,
con soporte para atestaciones pagas y mensajería cross-chain real.

*[English version](README.en.md)*

## Estado del proyecto

**Desplegado y validado en testnet.** Los 3 contratos principales
están verificados públicamente en Sepolia, con más de 40 tests
automatizados y análisis de seguridad con Slither aplicado en cada
componente. El flujo de mensajería cross-chain fue probado de punta a
punta entre dos redes reales (Sepolia y Arbitrum Sepolia).

Todavía no desplegado en mainnet — ver [Roadmap](#roadmap).

## Que resuelve

Hoy, si alguien se certifica en una plataforma, esa credencial vive
aislada ahí: no hay forma simple de que otro protocolo, empleador, o
plataforma la verifique sin depender del sistema original. Attestify
es la capa que hace esas credenciales portables e interoperables
entre blockchains distintas.

## Componentes

| Contrato | Rol | Verificado |
|---|---|---|
| [`AttestationCore`](contracts/AttestationCore.sol) | Emision, revocacion y consulta de attestations (gratuitas y pagas) | [Sepolia](https://sepolia.etherscan.io/address/0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4#code) |
| [`FeeCollector`](contracts/FeeCollector.sol) | Cobro de fee fijo por operacion | [Sepolia](https://sepolia.etherscan.io/address/0xFd6e2f8e06C007688CDB861688a631165E4c8525#code) |
| [`CrossChainRelay`](contracts/CrossChainRelay.sol) | Mensajeria cross-chain via LayerZero | [Sepolia](https://sepolia.etherscan.io/address/0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E#code) |

## Arquitectura

- Red base: Ethereum mainnet + L2s (Arbitrum, Optimism)
- Mensajeria cross-chain: LayerZero
- Extension futura planeada: Solana via Wormhole

Ver el detalle de esta decision en [`docs/adr/0001-arquitectura-base.md`](docs/adr/0001-arquitectura-base.md).

## Modelo de negocio

- Fee fijo (~5 centavos de USD, ajustable) en toda attestation.
- Fee porcentual (5%) adicional en attestations pagas, repartido
  automaticamente entre la plataforma y el emisor de la credencial.
- Sin token propio ni tokenomics especulativos.

Detalle completo en [`docs/adr/0002-modelo-de-monetizacion.md`](docs/adr/0002-modelo-de-monetizacion.md)
y [`docs/adr/0004-fee-porcentual-attestations-pagas.md`](docs/adr/0004-fee-porcentual-attestations-pagas.md).

## SDK

Paquete de TypeScript (`sdk/`) para integrar Attestify sin escribir
llamadas a contratos a mano. Ver [`docs/USAGE.md`](docs/USAGE.md).

## Documentacion

- [`docs/architecture.md`](docs/architecture.md) - vision general del sistema
- [`docs/adr/`](docs/adr/) - decisiones de arquitectura documentadas
- [`docs/deployments/`](docs/deployments/) - direcciones y detalle de cada deployment
- [`docs/guides/cross-chain-testing.md`](docs/guides/cross-chain-testing.md) - como se valido el flujo cross-chain real

## Roadmap

- [ ] Auditoria de seguridad externa antes de mainnet
- [ ] Primer caso de uso real integrado
- [ ] SDK con soporte para mensajeria cross-chain
- [ ] Deploy en mainnet

## Licencia

Apache 2.0. Ver [`LICENSE`](LICENSE).