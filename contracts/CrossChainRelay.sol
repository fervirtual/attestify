// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, Origin, MessagingFee } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OAppOptionsType3.sol";

/// @title CrossChainRelay
/// @notice Notifica la emision y revocacion de attestations a otras
///         cadenas via LayerZero, para que AttestationCore en una red
///         destino pueda reflejar attestations emitidas en la red origen.
///         Ver docs/adr/0001-arquitectura-base.md para el contexto.
contract CrossChainRelay is OApp, OAppOptionsType3 {
    event AttestationNotified(
        uint32 indexed dstEid,
        bytes32 indexed uid,
        bytes32 schema,
        address indexed attester,
        address recipient
    );

    event AttestationReceived(
        uint32 indexed srcEid,
        bytes32 indexed uid,
        bytes32 schema,
        address attester,
        address recipient
    );

    /// @param _endpoint Direccion del Endpoint de LayerZero en esta red.
    /// @param delegate Direccion con permisos de configuracion (owner).
    constructor(address _endpoint, address delegate)
        OApp(_endpoint, delegate)
        Ownable(delegate)
    {}

    /// @notice Calcula el costo estimado (en la moneda nativa) de notificar
    ///         una attestation a otra cadena.
    function quoteNotify(
        uint32 dstEid,
        bytes32 uid,
        bytes32 schema,
        address attester,
        address recipient,
        bytes calldata options
    ) external view returns (MessagingFee memory fee) {
        bytes memory payload = abi.encode(uid, schema, attester, recipient);
        fee = _quote(dstEid, payload, options, false);
    }

    /// @notice Notifica a otra cadena que una attestation fue emitida.
    /// @param dstEid Identificador de la cadena destino en LayerZero.
    /// @param options Opciones de ejecucion (gas en destino, etc).
    function notifyAttestation(
        uint32 dstEid,
        bytes32 uid,
        bytes32 schema,
        address attester,
        address recipient,
        bytes calldata options
    ) external payable {
        bytes memory payload = abi.encode(uid, schema, attester, recipient);

        emit AttestationNotified(dstEid, uid, schema, attester, recipient);

        _lzSend(
            dstEid,
            payload,
            options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
    }

    /// @notice Se ejecuta automaticamente cuando llega un mensaje desde
    ///         otra cadena. No debe llamarse directamente.
    function _lzReceive(
        Origin calldata origin,
        bytes32 /* guid */,
        bytes calldata payload,
        address /* executor */,
        bytes calldata /* extraData */
    ) internal override {
        (bytes32 uid, bytes32 schema, address attester, address recipient) =
            abi.decode(payload, (bytes32, bytes32, address, address));

        emit AttestationReceived(origin.srcEid, uid, schema, attester, recipient);
    }
}
