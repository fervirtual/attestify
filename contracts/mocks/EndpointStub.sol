// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/// @title EndpointStub
/// @notice Stub minimo del Endpoint de LayerZero, unicamente para tests
///         locales de CrossChainRelay. NO reemplaza pruebas end-to-end
///         reales en testnet (ver docs/adr para el contexto de esta
///         limitacion, pendiente hasta que LayerZero soporte Hardhat 3
///         en su toolkit oficial de testing).
contract EndpointStub {
    struct MessagingParams {
        uint32 dstEid;
        bytes32 receiver;
        bytes message;
        bytes options;
        bool payInLzToken;
    }

    struct MessagingFee {
        uint256 nativeFee;
        uint256 lzTokenFee;
    }

    struct MessagingReceipt {
        bytes32 guid;
        uint64 nonce;
        MessagingFee fee;
    }

    /// @notice Fee fijo que este stub simula devolver en cada quote.
    uint256 public stubNativeFee = 1_000_000_000_000;

    address public delegate;

    event StubSend(uint32 dstEid, bytes message, uint256 valueSent);

    function quote(
        MessagingParams calldata /* params */,
        address /* sender */
    ) external view returns (MessagingFee memory) {
        return MessagingFee(stubNativeFee, 0);
    }

    function send(
        MessagingParams calldata params,
        address /* refundAddress */
    ) external payable returns (MessagingReceipt memory) {
        require(msg.value >= stubNativeFee, "Fee insuficiente en stub");
        emit StubSend(params.dstEid, params.message, msg.value);
        return MessagingReceipt(
            keccak256(abi.encode(params, block.timestamp)),
            1,
            MessagingFee(msg.value, 0)
        );
    }

    function setDelegate(address _delegate) external {
        delegate = _delegate;
    }
}