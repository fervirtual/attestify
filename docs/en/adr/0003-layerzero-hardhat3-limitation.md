# ADR 0003: LayerZero and Hardhat 3 limitation, and testing strategy

*[Versión en español](../../adr/0003-limitacion-layerzero-hardhat3.md)*

## Status
Accepted

## Context
When integrating LayerZero (see ADR 0001) into the already-established
Hardhat 3 project, several real ecosystem compatibility issues arose,
not attributable to configuration mistakes on our part:

1. The `@layerzerolabs/oapp-evm` package declares an `exports` field
   in its `package.json` that only allows importing `package.json` and
   already-compiled artifacts (`artifacts/*.json`), blocking resolution
   of Solidity source (`.sol`) imports that Hardhat 3 needs to compile.
   This breaks direct importing of its base contracts (`OApp.sol`,
   etc).

2. The alternative package `@layerzerolabs/lz-evm-oapp-v2` (the
   package's older naming) DOES expose the source code without
   `exports` restrictions, and turned out to be the working path to
   import OApp's base contracts.

3. LayerZero's official testing toolkit
   (`@layerzerolabs/test-devtools-evm-hardhat`, up to version 0.5.3)
   declares `hardhat ^2.22.10` as a peer dependency, with no Hardhat 3
   support. This prevents using the official tools to simulate two
   networks communicating locally in tests.

4. The `EndpointV2Mock` provided by LayerZero (inside
   `artifacts/EndpointV2Mock.sol/EndpointV2Mock.json`) is functionally
   equivalent to the full production Endpoint (requires registering
   messaging libraries, verification, etc), so it's not a simple
   substitute for isolated testing.

## Decision
- `@layerzerolabs/lz-evm-oapp-v2` (not `oapp-evm`) is used to import
  OApp's base contracts in `CrossChainRelay.sol`.
- A minimal, custom contract, `EndpointStub.sol` (in
  `contracts/mocks/`), was built, implementing only the functions
  (`quote`, `send`, `setDelegate`) that `OApp` needs to operate,
  without replicating LayerZero's real message
  verification/delivery logic.
- Local `CrossChainRelay` tests (`test/CrossChainRelay.ts`) use this
  stub to validate: access control (`_lzReceive` only callable from
  the configured endpoint), correct simulated fee collection, and
  event emission.
- Real end-to-end validation (a message actually traveling from one
  chain to another and being delivered) is deferred to the real
  testnet deployment stage (see staged security plan), since
  replicating that simulation locally without the official toolkit
  would mean building a custom messaging engine, with the risk of not
  faithfully reflecting real production behavior.

## Alternatives considered
- **Using `test-devtools-evm-hardhat` forced with `--legacy-peer-deps`**:
  discarded because the incompatibility isn't just a declared version
  mismatch but likely an internal plugin architecture difference
  between Hardhat 2 and 3, with high risk of hard-to-diagnose
  failures.
- **Replicating LayerZero's full messaging engine for local testing**:
  discarded due to time cost and the risk that a homemade replica
  wouldn't reflect real behavior, giving a false sense of security.
- **Waiting for LayerZero to officially support Hardhat 3**: discarded
  as a total blocker; the decision is to move forward with the
  minimal stub and revisit this ADR once the ecosystem supports it.

## Consequences
- `CrossChainRelay`'s test coverage is solid at the level of its own
  logic (access control, fees, events) but does NOT validate the real
  cross-chain message delivery flow.
- Before any mainnet deployment, validating the full flow on real
  testnets (e.g., Sepolia and another L2 testnet) is mandatory.
- Periodically check whether `@layerzerolabs/test-devtools-evm-hardhat`
  releases a Hardhat 3-compatible version, to replace the homemade
  stub with the official toolkit and expand local test coverage.

## Update: end-to-end validation completed
The gap mentioned above (lack of real end-to-end validation between
two chains) was closed. `CrossChainRelay` was deployed on a second
real network (Arbitrum Sepolia), peers were configured, and a real
message was sent and confirmed delivered from Sepolia.

Full process and result detail in
docs/en/guides/cross-chain-testing.md.