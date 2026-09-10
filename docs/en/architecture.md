# Attestify Architecture

*[Versión en español](../architecture.md)*

## Overview

Attestify is a layer for verifiable credentials and attestations,
designed to be interoperable across multiple blockchains. The goal is
for a credential issued on one chain to be verifiable from any other,
without depending on the original issuing platform.

## Core components

- **Attestation layer**: built on EAS (Ethereum Attestation Service)
  as the base standard on Ethereum and its L2s.
- **Cross-chain messaging layer**: LayerZero, responsible for securely
  transporting attestation information between chains.
- **Fee/monetization layer**: on-chain mechanism that charges a small
  amount per issuance/verification operation (see ADR 0002).
- **Developer SDK**: interface that platforms (like HackChain) will
  use to integrate Attestify without dealing directly with the
  complexity of each chain.

## Design decisions

See the detail and reasoning behind each decision in:
- [`docs/en/adr/0001-base-architecture.md`](adr/0001-base-architecture.md) — base network and cross-chain messaging choice
- [`docs/en/adr/0002-monetization-model.md`](adr/0002-monetization-model.md) — automatic fee + open core model

## Design principles

- **Decoupling between business logic and transport**: credential
  logic should not depend directly on LayerZero, so the messaging
  layer can be changed or extended without rewriting the core.
- **Transparency by design**: the fee charged must be visible and
  auditable directly in the contract, not hidden in separate
  documentation.
- **Extensibility toward non-EVM ecosystems**: the architecture
  anticipates adding support for Solana (via Wormhole) without a
  major redesign.

## Current status

Deployed and validated on Sepolia (testnet), with all 3 contracts
publicly verified. The cross-chain flow was tested end-to-end between
Sepolia and Arbitrum Sepolia. See
[`docs/en/deployments/`](deployments/) for full detail.