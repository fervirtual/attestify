# Attestify — Full project overview

This document summarizes the entire project in one place: what it is,
why it exists, how it's built, and its current status. Intended for
sharing with someone evaluating the project from the outside, or as
internal reference.

*[Versión en español](../PROJECT_OVERVIEW.md)*

## What is Attestify

A verifiable credentials ("attestations") framework that works
interoperably across different blockchains. It allows issuing,
verifying, and revoking on-chain credentials, with two usage models:
free and paid (with automatic revenue split between the platform and
the credential issuer).

## The problem it solves

Today, a credential issued on one platform (for example, a security
certification on HackChain) lives isolated there. If another
platform, employer, or protocol wanted to verify that credential, it
has no standard way to do so without depending directly on the
original system. Attestify aims to be the interoperability layer that
solves this, building on the EAS (Ethereum Attestation Service)
standard and extending it across multiple chains.

## Why this approach, and not another

- **No native token**: foundations and grant committees (Ethereum,
  Arbitrum, Optimism, etc.) tend to systematically reject projects
  dependent on speculative tokenomics. Attestify is funded through
  protocol fees, not token presales.
- **Chain-agnostic by design**: instead of building custom
  cross-chain bridges (a historical source of major hacks in the
  ecosystem), it relies on LayerZero as an already-proven messaging
  layer.

## Technical architecture

3 core contracts, each with a clear responsibility:

1. **FeeCollector**: collects a fixed fee (adjustable, currently
   ~$0.05 USD) per operation. Has a hardcoded maximum cap and
   emergency pause capability.
2. **AttestationCore**: credential registry. Supports free and paid
   issuance (with a 95%/5% split between issuer and platform),
   revocation, and validity lookup.
3. **CrossChainRelay**: notifies attestation issuance to other chains
   via LayerZero, to reflect credentials across networks.

Every significant architecture decision is documented as an ADR
(Architecture Decision Record) in `docs/en/adr/`, with context,
alternatives considered, and consequences.

## Security status

- 40+ automated tests covering success and attack scenarios (access
  control, limits, reentrancy).
- Static analysis with Slither applied to every contract, with
  documented fixes.
- Reentrancy protection on functions handling transfers to third
  parties.
- Pending before mainnet: professional external security audit (not
  replaceable by automated tooling when real funds are at stake).

## Deployment status

- **Sepolia (testnet)**: all 3 contracts deployed and **publicly
  verified** on Etherscan, Blockscout, and Sourcify - the source code
  is auditable by anyone, no need to trust the team's word.
- **Arbitrum Sepolia (testnet)**: CrossChainRelay deployed to validate
  the real cross-chain flow.
- **Real end-to-end validation**: a real message was sent from
  Sepolia, its delivery was confirmed on Arbitrum Sepolia (correctly
  decoded event), proving cross-chain interoperability works in
  practice, not just in theory.
- **Mainnet**: not yet deployed (see roadmap).

## Business model

Two combined revenue sources:

1. **Fixed fee** on every attestation (free or paid) - baseline
   revenue guaranteed by usage volume.
2. **Percentage fee (5%)** additionally, only when the credential has
   a price set by the issuer - the recipient pays that price, the
   contract automatically splits 95% to the issuer and 5% to the
   platform.

No dependence on a native token or speculation.

## SDK

TypeScript package that wraps contract calls into simple functions
(`issueAttestation`, `revokeAttestation`, `getAttestation`,
`isValid`), with automatic ABI synchronization between contracts and
the SDK to prevent drift.

## What's left before a real launch

- Professional external security audit.
- First real-world use case integrated (evaluating HackChain as a
  natural candidate, given the context of who built the project).
- Expand the SDK to expose cross-chain functionality.
- Mainnet deployment, with the treasury migrated to a multisig wallet
  (not an individual wallet) for security.

## Links

- Repository: https://github.com/fervirtual/attestify
- Full technical documentation: `docs/`