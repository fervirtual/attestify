# ADR 0002: Monetization model

*[Versión en español](../../adr/0002-modelo-de-monetizacion.md)*

## Status
Accepted

## Context
Attestify is distributed under the Apache 2.0 license (see ADR 0001
and LICENSE), which allows free use, modification, and distribution,
even commercial, with no obligation to pay. This favors mass adoption
but doesn't generate revenue on its own. A monetization mechanism
compatible with a permissive license and the goal of broad adoption
needs to be defined.

## Decision
Two complementary mechanisms are adopted:

1. **Automatic on-chain usage fee**: the smart contract charges a
   small amount (to be defined, on the order of cents of a dollar)
   per attestation issuance/verification operation, regardless of who
   uses it. The fee is automatically transferred to a designated
   wallet. This mechanism applies equally to all users, with no
   distinction between individual or enterprise use, and is
   determined by the protocol itself, not by case-by-case commercial
   agreements.

2. **Open core**: the base framework remains open (Apache 2.0).
   Additional enterprise-oriented features (dedicated support, admin
   dashboards, SLAs, custom integrations) are offered as a separate,
   paid package, outside the scope of the open license.

## Alternatives considered
- **BSL-style restrictive license**: discarded because it introduces
  adoption friction and may alienate part of the open-source
  community, contradicting the primary goal of mass adoption.
- **Relying solely on donations/sponsorship**: discarded for not
  being a predictable or scalable source of revenue.

## Consequences
- The on-chain fee must be clearly documented and visible in the
  contract code, auditable by any user or integrator, to maintain
  transparency (see also pending legal considerations to be
  reviewed).
- Development must maintain a clear separation between the open core
  and any future "enterprise" layer features, to avoid accidentally
  leaking paid functionality into the open-source package.
- The exact fee amount and the legal/tax implications of receiving
  these automatic payments into a personal wallet remain pending
  definition.