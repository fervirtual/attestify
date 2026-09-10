# ADR 0001: Attestify base architecture

*[Versión en español](../../adr/0001-arquitectura-base.md)*

## Status
Accepted

## Context
Attestify aims to be a layer for verifiable, cross-chain interoperable
credentials/attestations. It's necessary to define which network(s) to
build on initially and which mechanism to use for cross-chain
communication.

## Decision
- **Base network**: Ethereum mainnet, with Arbitrum and Optimism as
  initial L2s. Ethereum was chosen because it hosts EAS (Ethereum
  Attestation Service), the most mature attestation standard in the
  ecosystem, and Attestify aims to build interoperability on top of
  that standard rather than compete against it.
- **Cross-chain messaging layer**: LayerZero. Chosen for being the
  option with the most adoption and precedent from identity/credential
  projects built on it, reducing the risk of reinventing already
  solved security patterns.
- **Future extension**: adding support for Solana via Wormhole is
  planned for later, without requiring a redesign of the base
  architecture.

## Alternatives considered
- **Chainlink CCIP**: discarded for now due to higher initial
  integration overhead, though it remains an option to reevaluate.
- **Wormhole as the primary messaging layer**: discarded as the
  initial option because its strength lies more in non-EVM
  ecosystems; reserved for the Solana extension phase.

## Consequences
- Initial development is concentrated on the EVM ecosystem.
- Business logic (credentials) must remain decoupled from transport
  (LayerZero), so messaging layers can be changed or added without
  rewriting the core.