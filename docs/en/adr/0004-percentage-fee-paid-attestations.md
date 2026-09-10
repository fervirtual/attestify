# ADR 0004: Percentage fee for paid attestations

*[Versión en español](../../adr/0004-fee-porcentual-attestations-pagas.md)*

## Status
Accepted

## Context
The current monetization model (ADR 0002) charges a fixed fee per
operation in FeeCollector, independent of any associated monetary
value. This works for the general case, but doesn't capture value
when there's a real economic transaction between a credential's
issuer and its recipient (for example, a platform charging to certify
a user).

## Decision
A percentage fee mechanism (5%) is added, applying specifically to
paid attestations, as an ADDITIONAL model to the existing fixed fee
(not replacing it):

- The issuer (attester) can optionally set a price when issuing an
  attestation.
- The recipient pays that price at the time of issuance.
- The contract automatically splits the payment: 5% to Attestify's
  treasury, 95% to the issuer.
- FeeCollector's fixed fee still applies to EVERY attestation (paid
  or not), as baseline revenue independent of this mechanism.

This is scenario "B", noted as a future extension in ADR 0002.

## Alternatives considered
- **Having the issuer pay instead of the recipient**: discarded
  because it would turn the fee into a pure cost for the issuer, with
  no direct benefit, discouraging adoption (poor value proposition).
- **Replacing the fixed fee with the percentage one**: discarded
  because the fixed fee still generates revenue on free credentials,
  which will likely be the majority of initial volume.

## Consequences
- Requires modifying AttestationCore (or adding a new contract) to
  support a payment flow with price, automatic split, and transfer to
  the issuer.
- Increases the system's attack surface (handles fund transfers
  between two parties, not just toward the treasury) - requires the
  same security cycle already applied to the other contracts (tests,
  Slither).
- The issuer must trust that the contract correctly transfers their
  95% - this must be clearly auditable via events, same as the rest
  of the system.
- Still pending: defining what happens if the recipient doesn't have
  sufficient funds (likely reverting the issuance), and whether the
  price can be modified after being set.