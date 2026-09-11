# Using Attestify

*[Versión en español](../USAGE.md)*

This guide shows how to integrate the Attestify SDK (`sdk/`) into your
own project to issue, revoke, and query verifiable credentials.

## Installation

> The package isn't published on npm yet (see project status in the
> README). For now, it's used locally by pointing to the repo's
> `sdk/` folder, or by copying `sdk/dist` once built with
> `npm run build`.

```bash
npm install ethers
```

## Initialization

The SDK needs the addresses of the already-deployed contracts
(`AttestationCore` and `FeeCollector`), and an ethers `Signer` or
`Provider` to interact with the blockchain.

```typescript
import { ethers } from "ethers";
import { Attestify } from "attestify";

const provider = new ethers.JsonRpcProvider("https://your-rpc-here");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);

const attestify = new Attestify(
  {
    attestationCoreAddress: "0x...",
    feeCollectorAddress: "0x...",
  },
  signer
);
```

## Issuing an attestation

The current fee is calculated and paid automatically — no need to
query or handle it manually.

```typescript
const uid = await attestify.issueAttestation({
  schema: "0x...", // credential type identifier
  recipient: "0xRecipientAddress",
  expirationTime: 0, // 0 = never expires
  revocable: true,
  data: "0x...", // credential content, encoded
});

console.log("Attestation created:", uid);
```

## Querying an attestation

```typescript
const attestation = await attestify.getAttestation(uid);
console.log(attestation);
```

## Checking if an attestation is valid

Returns `false` if the attestation doesn't exist, was revoked, or
expired.

```typescript
const isValid = await attestify.isValid(uid);
```

## Revoking an attestation

Only works if the transaction signer is the original issuer of the
attestation, and it was created as revocable.

```typescript
await attestify.revokeAttestation(uid);
```

## Cross-chain messaging

If `crossChainRelayAddress` is configured when creating the client,
you can notify another network that an attestation was issued:

```typescript
const attestify = new Attestify(
  {
    attestationCoreAddress: "0x...",
    feeCollectorAddress: "0x...",
    crossChainRelayAddress: "0x...",
  },
  signer
);

const txHash = await attestify.notifyCrossChain({
  dstEid: 40231, // destination network's LayerZero Endpoint ID
  uid: "0x...",
  schema: "0x...",
  attester: "0xIssuerAddress",
  recipient: "0xRecipientAddress",
});

console.log("Notified, tx:", txHash);
```

The LayerZero fee is calculated and paid automatically. The cost can
also be queried separately with `quoteCrossChainNotify()`.

## Notes

- This SDK is in an early stage (v0.1.0): the interface may change
  before a stable 1.0 release.