// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FeeCollector.sol";

/// @title AttestationCore
/// @notice Registro de credenciales/attestations verificables, inspirado
///         en el estandar EAS (Ethereum Attestation Service). Cada
///         emision de attestation cobra un fee a traves de FeeCollector
///         (ver docs/adr/0002-modelo-de-monetizacion.md). Tambien
///         soporta attestations pagas con reparto porcentual (ver
///         docs/adr/0004-fee-porcentual-attestations-pagas.md).
contract AttestationCore is Ownable, ReentrancyGuard {
    struct Attestation {
        bytes32 uid;
        bytes32 schema;
        address attester;
        address recipient;
        uint256 time;
        uint256 expirationTime;
        bool revocable;
        bool revoked;
        bytes data;
    }

    /// @notice Contrato que cobra el fee por cada operacion.
    FeeCollector public feeCollector;

    /// @notice Attestations indexadas por su uid.
    mapping(bytes32 => Attestation) private attestations;

    /// @notice Porcentaje (en basis points, 500 = 5.00%) que se
    ///         queda la plataforma en attestations pagas.
    uint256 public constant PERCENTAGE_FEE_BPS = 500;

    event AttestationIssued(
        bytes32 indexed uid,
        bytes32 schema,
        address indexed attester,
        address indexed recipient
    );

    event AttestationRevoked(bytes32 indexed uid, address indexed attester);

    event PaidAttestationIssued(
        bytes32 indexed uid,
        address indexed attester,
        address indexed recipient,
        uint256 price,
        uint256 platformCut
    );

    event FeeCollectorUpdated(address indexed oldFeeCollector, address indexed newFeeCollector);

    /// @param initialFeeCollector Direccion del contrato FeeCollector a usar.
    constructor(address initialFeeCollector) Ownable(msg.sender) {
        require(initialFeeCollector != address(0), "FeeCollector invalido");
        feeCollector = FeeCollector(initialFeeCollector);
    }

    /// @notice Emite una nueva attestation gratuita. Requiere pagar el
    ///         fee vigente en FeeCollector.
    /// @param schema Identificador del tipo de credencial.
    /// @param recipient A quien se le emite la credencial.
    /// @param expirationTime Momento de expiracion (0 = no expira).
    /// @param revocable Si la attestation puede ser revocada mas adelante.
    /// @param data Contenido de la credencial.
    /// @return uid Identificador unico de la attestation creada.
    function issueAttestation(
        bytes32 schema,
        address recipient,
        uint256 expirationTime,
        bool revocable,
        bytes calldata data
    ) external payable returns (bytes32 uid) {
        require(recipient != address(0), "Recipient invalido");

        uid = keccak256(
            abi.encode(schema, msg.sender, recipient, block.timestamp, data)
        );

        require(attestations[uid].attester == address(0), "Attestation ya existe");

        attestations[uid] = Attestation({
            uid: uid,
            schema: schema,
            attester: msg.sender,
            recipient: recipient,
            time: block.timestamp,
            expirationTime: expirationTime,
            revocable: revocable,
            revoked: false,
            data: data
        });

        emit AttestationIssued(uid, schema, msg.sender, recipient);

        feeCollector.collectFee{value: msg.value}();

        return uid;
    }

    /// @notice Emite una attestation paga. El recipient (msg.sender)
    ///         paga el fee fijo mas el precio fijado, y el contrato
    ///         reparte automaticamente ese precio: PERCENTAGE_FEE_BPS
    ///         a la treasury de Attestify, el resto al attester.
    /// @param schema Identificador del tipo de credencial.
    /// @param attester Quien otorga la credencial y recibe el pago.
    /// @param expirationTime Momento de expiracion (0 = no expira).
    /// @param revocable Si la attestation puede ser revocada mas adelante.
    /// @param data Contenido de la credencial.
    /// @param price Precio en wei que el recipient paga por la credencial.
    /// @return uid Identificador unico de la attestation creada.
    function issuePaidAttestation(
        bytes32 schema,
        address attester,
        uint256 expirationTime,
        bool revocable,
        bytes calldata data,
        uint256 price
    ) external payable nonReentrant returns (bytes32 uid) {
        require(attester != address(0), "Attester invalido");
        require(price > 0, "Use issueAttestation para credenciales gratuitas");

        uint256 fixedFee = feeCollector.fee();
        require(msg.value == fixedFee + price, "Monto incorrecto");

        uid = keccak256(
            abi.encode(schema, attester, msg.sender, block.timestamp, data)
        );

        require(attestations[uid].attester == address(0), "Attestation ya existe");

        attestations[uid] = Attestation({
            uid: uid,
            schema: schema,
            attester: attester,
            recipient: msg.sender,
            time: block.timestamp,
            expirationTime: expirationTime,
            revocable: revocable,
            revoked: false,
            data: data
        });

        uint256 platformCut = (price * PERCENTAGE_FEE_BPS) / 10000;
        uint256 attesterCut = price - platformCut;

        emit AttestationIssued(uid, schema, attester, msg.sender);
        emit PaidAttestationIssued(uid, attester, msg.sender, price, platformCut);

        feeCollector.collectFee{value: fixedFee}();

        address treasury = feeCollector.treasury();
        (bool sentPlatform, ) = treasury.call{value: platformCut}("");
        require(sentPlatform, "Transferencia a treasury fallida");

        (bool sentAttester, ) = attester.call{value: attesterCut}("");
        require(sentAttester, "Transferencia a attester fallida");

        return uid;
    }

    /// @notice Revoca una attestation existente. Solo puede hacerlo quien
    ///         la emitio originalmente, y solo si era revocable.
    function revokeAttestation(bytes32 uid) external {
        Attestation storage a = attestations[uid];
        require(a.attester != address(0), "Attestation no existe");
        require(a.attester == msg.sender, "Solo el emisor puede revocar");
        require(a.revocable, "Attestation no es revocable");
        require(!a.revoked, "Ya fue revocada");

        a.revoked = true;
        emit AttestationRevoked(uid, msg.sender);
    }

    /// @notice Devuelve una attestation por su uid.
    function getAttestation(bytes32 uid) external view returns (Attestation memory) {
        return attestations[uid];
    }

    /// @notice Indica si una attestation es valida: existe, no fue
    ///         revocada, y no expiro.
    function isValid(bytes32 uid) external view returns (bool) {
        Attestation memory a = attestations[uid];
        if (a.attester == address(0)) return false;
        if (a.revoked) return false;
        if (a.expirationTime != 0 && block.timestamp > a.expirationTime) return false;
        return true;
    }

    /// @notice Actualiza el contrato de FeeCollector usado. Solo el owner.
    function setFeeCollector(address newFeeCollector) external onlyOwner {
        require(newFeeCollector != address(0), "FeeCollector invalido");
        address oldFeeCollector = address(feeCollector);
        feeCollector = FeeCollector(newFeeCollector);
        emit FeeCollectorUpdated(oldFeeCollector, newFeeCollector);
    }
}