# Attestify

Framework for verifiable credentials and attestations, interoperable
across blockchains. Issue, verify, and revoke on-chain credentials,
with support for paid attestations and real cross-chain messaging.

*[Versión en español](README.md)*

## Project status

**Deployed and validated on testnet.** All 3 core contracts are
publicly verified on Sepolia, with 40+ automated tests and static
security analysis (Slither) applied to every component. The
cross-chain messaging flow was tested end-to-end between two real
networks (Sepolia and Arbitrum Sepolia).

Not yet deployed to mainnet — see [Roadmap](#roadmap).

## What it solves

Today, when someone earns a credential on a platform, it lives
isolated there: there's no simple way for another protocol, employer,
or platform to verify it without depending on the original system.
Attestify is the layer that makes credentials portable and
interoperable across different blockchains.

## Components

| Contract | Role | Verified |
|---|---|---|
| [`AttestationCore`](contracts/AttestationCore.sol) | Issuance, revocation, and lookup of attestations (free and paid) | [Sepolia](https://sepolia.etherscan.io/address/0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4#code) |
| [`FeeCollector`](contracts/FeeCollector.sol) | Fixed fee collection per operation | [Sepolia](https://sepolia.etherscan.io/address/0xFd6e2f8e06C007688CDB861688a631165E4c8525#code) |
| [`CrossChainRelay`](contracts/CrossChainRelay.sol) | Cross-chain messaging via LayerZero | [Sepolia](https://sepolia.etherscan.io/address/0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E#code) |

## Architecture

- Base network: Ethereum mainnet + L2s (Arbitrum, Optimism)
- Cross-chain messaging: LayerZero
- Planned future extension: Solana via Wormhole

Full decision rationale in [`docs/en/adr/0001-base-architecture.md`](docs/en/adr/0001-base-architecture.md).

## Business model

- Fixed fee (~$0.05 USD, adjustable) on every attestation.
- Additional 5% percentage fee on paid attestations, automatically
  split between the platform and the credential issuer.
- No native token, no speculative tokenomics.

Full detail in [`docs/en/adr/0002-monetization-model.md`](docs/en/adr/0002-monetization-model.md)
and [`docs/en/adr/0004-percentage-fee-paid-attestations.md`](docs/en/adr/0004-percentage-fee-paid-attestations.md).

## SDK

TypeScript package (`sdk/`) to integrate Attestify without writing
raw contract calls. See [`docs/en/USAGE.md`](docs/en/USAGE.md).

## Documentation

- [`docs/en/architecture.md`](docs/en/architecture.md) - system overview
- [`docs/en/adr/`](docs/en/adr/) - documented architecture decisions
- [`docs/en/deployments/`](docs/en/deployments/) - addresses and details per deployment
- [`docs/en/guides/cross-chain-testing.md`](docs/en/guides/cross-chain-testing.md) - how the real cross-chain flow was validated

## Roadmap

- [ ] External security audit before mainnet
- [ ] First real-world use case integrated
- [ ] SDK support for cross-chain messaging
- [ ] Mainnet deployment

## License

Apache 2.0. See [`LICENSE`](LICENSE).