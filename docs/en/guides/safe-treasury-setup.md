# Guide: setting up the Safe multisig as Attestify's treasury

*[Versión en español](../../guides/safe-treasury-setup.md)*

This guide documents the full process of creating a Safe wallet
(multisig) to serve as Attestify's future treasury, replacing the
individual wallet used until now.

## Why a Safe instead of an individual wallet

With an individual wallet (like the one used for deployment so far),
if the private key is lost or compromised, control of the funds is
lost forever. A Safe requires a minimum number of "signers" (separate
accounts) to approve any movement — losing a single key isn't
catastrophic if there are more signers.

## Step 1: creating the signer accounts in MetaMask

Two new, separate accounts were created:

1. **"Attestify Treasury"** — in the MetaMask extension on the
   computer.
2. **"Attestify Treasury - Signer 2"** — in a new, independent wallet
   (its own recovery phrase, not imported), installed on the phone.

Important: creating the second account with a *different* recovery
phrase is what provides real protection — if the same phrase is
imported on two devices, it's the same duplicated key, not two
separate keys.

## Step 2: creating the Safe on app.safe.global

1. Go to app.safe.global, connect with the "Attestify Treasury"
   wallet.
2. "My accounts" tab (not "Workspaces", which is a new paid layer not
   needed for this).
3. "Add accounts" → "Create new".
4. Name: "Attestify Treasury".
5. Network: Sepolia only (Ethereum mainnet was skipped for now, since
   the whole project remains in the testnet stage).
6. Signers: the connected account was left as the sole signer for now
   (threshold 1 of 1) — the second signer is added later, in a
   separate step (see below, pending).
7. Activation fee payment: "Pay later" was chosen (it's added to the
   first real transaction, instead of paying it separately when
   creating the Safe).

Address of the created Safe: `0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760`

## Step 3: funding the necessary accounts

Two Sepolia ETH transfers, both from the original deployment wallet
(which already had funds):

1. **To the Safe itself** (0.005 ETH) — for future real operations.
   Script: `scripts/fund-safe.ts`.
2. **To the individual signer account "Attestify Treasury"** (0.005
   ETH) — necessary because the gas fee to activate/operate the Safe
   is paid from the signer account, NOT from the Safe's balance. This
   step wasn't obvious at first: the first activation attempt failed
   with "Your connected wallet doesn't have enough funds" because the
   individual signer account had 0 ETH, even though the Safe already
   had funds. Script: `scripts/fund-signer.ts`.

## Step 4: activating the Safe on Sepolia

On the Safe dashboard (app.safe.global), "Activate your Safe account"
appears with two steps: "First interaction" (automatic) and "Activate
account on Sepolia" (requires a real transaction, paid by the signer
account).

### Problem found: MetaMask wasn't showing Sepolia

The "Sepolia" network didn't appear in MetaMask's network selector,
even though Sepolia had already been used in the project before (via
Hardhat). Cause: the "Show test networks" option was disabled in
MetaMask settings.

Solution found: instead of directly searching for the toggle (the
MetaMask interface had changed structure compared to older versions
and wasn't easy to find by manual navigation), "Add a custom network"
was tried by typing "Sepolia" — this showed a notice that the network
already existed with that Chain ID, with a link to "edit the original
network." Going there and saving (without changing anything)
automatically enabled the "Show test networks" toggle and Sepolia
became visible.

### Automatic network switch

Once Sepolia was available, there was no need to switch it manually
in MetaMask: when confirming the transaction in Safe, Safe itself
detected the network mismatch and showed a "Switch to Sepolia" button
that made the change automatically via MetaMask, only requiring a
permissions confirmation.

## Step 5: adding the second signer

Once the Safe was activated, "Manage signers" became enabled (it was
disabled before activation). The address of the "Signer 2" account
(the one created on the phone) was added, and the threshold was
changed from "1 of 2" to **"2 of 2"** — so that both signatures are
required for any transaction, providing real multisig protection.

## Step 6: migrating FeeCollector's treasury

With the Safe active and protected, `setTreasury()` was called on
`FeeCollector` (from the deployer wallet, the contract's owner),
pointing to the new Safe address. Script: `scripts/migrate-treasury.ts`.

Confirmed end-to-end: a new attestation was issued after the
migration, and the fee correctly arrived at the Safe's balance
(verified with `scripts/check-safe-balance.ts`).

## Current status

Safe created, funded, activated, with **real multisig complete**:
2 signers configured (computer + phone), 2-of-2 threshold — both
signatures are required for any transaction.

FeeCollector's treasury has been migrated to this Safe.

Address: `0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760`.

## Pending

- [ ] Create the equivalent Safe on Ethereum mainnet when the project
  is ready for real production, replicating this same 2-signer
  configuration from the start.