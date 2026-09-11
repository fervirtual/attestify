# Sepolia deployment (testnet)

*[Versión en español](../../deployments/sepolia.md)*

## Contract addresses (verified on Etherscan, Blockscout, and Sourcify)

| Contract | Address | Verification |
|---|---|---|
| FeeCollector | `0xFd6e2f8e06C007688CDB861688a631165E4c8525` | [Etherscan](https://sepolia.etherscan.io/address/0xFd6e2f8e06C007688CDB861688a631165E4c8525#code) · [Blockscout](https://eth-sepolia.blockscout.com/address/0xFd6e2f8e06C007688CDB861688a631165E4c8525#code) |
| AttestationCore | `0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4` | [Etherscan](https://sepolia.etherscan.io/address/0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4#code) · [Blockscout](https://eth-sepolia.blockscout.com/address/0xF0b82F9DB7c4A58E8c161B8781834bE8Fa381Cb4#code) |
| CrossChainRelay | `0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E` | [Etherscan](https://sepolia.etherscan.io/address/0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E#code) · [Blockscout](https://eth-sepolia.blockscout.com/address/0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E#code) |

## Deployment configuration

- Network: Ethereum Sepolia (Chain ID 11155111)
- Compilation profile: `production` (optimizer enabled, 200 runs)
- FeeCollector initial fee: 0.000001 ETH (later updated to ~$0.05
  USD, see `scripts/update-fee.ts`)
- Treasury: migrated to the Safe multisig
  `0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760` (originally the
  deployer account). See `docs/en/guides/safe-treasury-setup.md` for
  full detail.
- LayerZero endpoint used (CrossChainRelay): `0x6EDCE65403992e310A62460808c4b910D972f10f`
  (source: https://docs.layerzero.network/v2/deployments/deployed-contracts)

## Note on verification

Deployment and verification must use the same compilation profile
(`production`), without running other Hardhat commands (like
`hardhat run`) between compile and verify, since that can reset the
active profile to `default` and cause a bytecode mismatch between
what's deployed and what's verified.

## End-to-end validation

The full flow was confirmed against the deployed contracts: issuing a
real attestation (paying the current fee), and verifying the contract
recognizes it as valid (`isValid() == true`). Script used:
`scripts/test-e2e-sepolia.ts`.

## Cross-chain validation

Sending a real cross-chain message via CrossChainRelay between
Sepolia and Arbitrum Sepolia has already been successfully validated.
See full detail in `docs/en/guides/cross-chain-testing.md` and
`docs/en/deployments/arbitrum-sepolia.md`.