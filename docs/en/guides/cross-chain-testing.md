# Guide: testing the real cross-chain flow (Sepolia <-> Arbitrum Sepolia)

*[Versión en español](../../guides/cross-chain-testing.md)*

This guide documents the full process to validate that CrossChainRelay
truly works between two different networks, not just in local tests.

## Why a second network is needed

Local tests (test/CrossChainRelay.ts) use a homemade stub
(EndpointStub.sol) that simulates LayerZero's behavior, but never
test that a message actually travels from one blockchain to another.
For that, deploying to two real networks and sending a real message
between them is necessary.

## Step 1: choosing the second network and its LayerZero Endpoint

Arbitrum Sepolia was chosen (already committed to in ADR 0001). The
LayerZero Endpoint V2 address is found at:

https://docs.layerzero.network/v2/deployments/deployed-contracts

Interesting fact: LayerZero deploys its Endpoint V2 at the SAME
address across many different EVM networks (it uses CREATE2), so
Sepolia and Arbitrum Sepolia share the address:
`0x6EDCE65403992e310A62460808c4b910D972f10f`

## Step 2: getting testnet funds on the second network

### Attempt 1: traditional faucets (failed)

Several faucets (Alchemy, QuickNode, Chainlink) require the wallet to
hold a small balance on real MAINNET (ETH or LINK) to prevent service
abuse. Since the testing wallet is new and has no real funds
(correctly so, it shouldn't), these faucets rejected the request.

### Solution that worked: official bridge

Instead of requesting new funds, funds already held on Sepolia were
bridged to Arbitrum Sepolia:

1. Go to https://bridge.arbitrum.io
2. Enable "Testnet mode" (toggle, usually in the footer/settings)
3. Choose origin "Sepolia" and destination "Arbitrum Sepolia"
4. Enter the amount (0.01 ETH was enough)
5. Connect MetaMask (the testing wallet) and confirm
6. Wait ~10 minutes (the bridge crosses two real networks)

## Step 3: enabling the network in Alchemy

At dashboard.alchemy.com, inside the already-created app:
1. Go to that app's "Networks" section
2. Look for "Arbitrum" -> specifically enable "Arbitrum Sepolia"
   (not "Arbitrum Mainnet")
3. Copy the generated HTTPS URL

## Step 4: adding the variable to .env

A new variable is added, reusing the same private key as always (the
testing wallet is the same across all EVM networks):

ARBITRUM_SEPOLIA_RPC_URL=<alchemy url>


## Step 5: adding the network to hardhat.config.ts

Inside the `networks` block, a new entry is added:

```typescript
arbitrumSepolia: {
  type: "http",
  chainType: "l1",
  url: configVariable("ARBITRUM_SEPOLIA_RPC_URL"),
  accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
},
```

## Technique: checking a balance on any network via console

Useful for confirming funds arrived, without depending on MetaMask
showing the correct network in its interface:

```bash
npx hardhat console --network arbitrumSepolia
```

Inside the console, line by line (Hardhat 3 doesn't auto-inject
`ethers` as a global variable, it must be obtained explicitly):

```javascript
const hardhat = await import("hardhat");
const { ethers } = await hardhat.default.network.connect();
const [signer] = await ethers.getSigners();
const balance = await ethers.provider.getBalance(signer.address);
console.log(signer.address, ethers.formatEther(balance));
```

This queries the real blockchain directly (via the RPC configured for
that network) and shows the exact balance - more reliable than
looking at MetaMask's visual interface, which depends on having the
correct network selected there.

## Step 6: deploying CrossChainRelay on the second network

There's no need to deploy FeeCollector or AttestationCore on the
second network for this one-off test - only CrossChainRelay, with a
separate Ignition module (ignition/modules/CrossChainRelayArbitrum.ts).

```bash
npx hardhat ignition deploy ignition/modules/CrossChainRelayArbitrum.ts --network arbitrumSepolia
```

## Step 7: configuring setPeer on both contracts

Script: `scripts/cross-chain/setup-peers.ts`

```bash
npx hardhat run scripts/cross-chain/setup-peers.ts --network sepolia
```

Configures the peer in both directions in a single run (the script
explicitly connects to each network on its own).

## Step 8: sending a real message from Sepolia

Script: `scripts/cross-chain/send-cross-chain-message.ts`

```bash
npx hardhat run scripts/cross-chain/send-cross-chain-message.ts --network sepolia
```

This calls `notifyAttestation`, paying the LayerZero fee previously
quoted with `quoteNotify`. The script returns a transaction hash that
can be tracked at:

https://layerzeroscan.com (make sure to switch the selector from
"MAINNET" to "TESTNET" in the top left, otherwise it won't find the
transaction).

## Step 9: confirming receipt at destination

Script: `scripts/cross-chain/check-cross-chain-receipt.ts`

```bash
npx hardhat run scripts/cross-chain/check-cross-chain-receipt.ts --network arbitrumSepolia
```

### Important Alchemy limitation (free tier)

The `eth_getLogs` method is limited to a range of **10 blocks per
query** on Alchemy's free tier. Since Arbitrum produces blocks very
fast (~250ms each), searching for recent events requires walking
backward in 10-block chunks, since a large range can't be requested
at once. The script already handles this automatically (it iterates
up to 3000 times over 10-block chunks = ~30000 blocks of history).

If the error says `"UnknownError: Received an unexpected status
code..."` with no further detail, it's likely this limit - to see
Alchemy's actual message, the query needs to be made with a direct
`fetch` to the RPC instead of through Hardhat/ethers, which hides the
error body across several layers.

## Result: successful validation

Message sent from Sepolia, delivered on Arbitrum Sepolia, confirmed
by the `AttestationReceived` event:

srcEid: 40161 (Sepolia)
uid: 0x0000000000000000000000000000000000000000000000000000000000000099
schema: 0x0000000000000000000000000000000000000000000000000000000000000001
attester: 0x8A2030E0657fa7013E686da1CEE823Eb2536973B
recipient: 0x8A2030E0657fa7013E686da1CEE823Eb2536973B
tx hash (destination): 0x39d4e344b5253c06eecde046c13b6f55d84ac2bb7b03eb8dabe1187ff05adfef
Delivery time: ~1m 27s (per LayerZeroScan)


This confirms CrossChainRelay works correctly between two real
networks, closing the validation gap documented in ADR 0003.

## Deployment addresses used in this test

- CrossChainRelay on Sepolia: `0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E`
- CrossChainRelay on Arbitrum Sepolia: `0xA73EB3aAcE334FFF3b910AdF40AbFF4bB25E93dD`
  (note: matches the address from the first Sepolia deploy attempt,
  due to a nonce coincidence - see technical note below)

## Technical note: address coincidence across networks

A new contract's address is calculated from the deployer's address
and their nonce (transaction number), independent of which network
it's deployed on. Since CrossChainRelay on Arbitrum Sepolia was the
deployer wallet's very first transaction on that network (nonce 0),
it exactly matched the address from the first deploy attempt on
Sepolia (which was also nonce 0 there at the time). This is expected
behavior, not an error.

## Lesson learned about heredocs in this terminal

Long `cat > file << 'EOF' ... EOF` blocks, pasted into the Git Bash
terminal inside Cursor, tend to get corrupted with mixed or truncated
content. For configuration or code files, it's more reliable to edit
directly in Cursor's editor (create the file, paste the content,
Ctrl+S) instead of using heredocs through the terminal.