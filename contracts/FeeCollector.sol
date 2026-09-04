// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title FeeCollector
/// @notice Cobra un fee fijo y configurable por cada operación registrada,
///         y lo transfiere automáticamente a una dirección de tesorería.
///         Ver docs/adr/0002-modelo-de-monetizacion.md para el contexto
///         de esta decisión.
contract FeeCollector is Ownable, Pausable {
    /// @notice Monto del fee en wei, cobrado por cada operación.
    uint256 public fee;

    /// @notice Dirección que recibe los fees cobrados.
    address public treasury;

    /// @notice Tope máximo que el fee puede alcanzar, ni el owner puede superarlo.
    uint256 public constant MAX_FEE = 0.01 ether;

    event FeeCharged(address indexed payer, uint256 amount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    /// @param initialFee Monto inicial del fee, en wei.
    /// @param initialTreasury Dirección inicial que recibe los fees.
    constructor(uint256 initialFee, address initialTreasury)
        Ownable(msg.sender)
    {
        require(initialTreasury != address(0), "Treasury invalida");
        require(initialFee <= MAX_FEE, "Fee excede el maximo permitido");
        fee = initialFee;
        treasury = initialTreasury;
    }

    /// @notice Cobra el fee actual. Pensado para ser llamado desde el
    ///         contrato de attestations en cada emision/verificacion.
    ///         No funciona mientras el contrato esta pausado.
    function collectFee() external payable whenNotPaused {
        require(msg.value >= fee, "Fee insuficiente");

        emit FeeCharged(msg.sender, msg.value);

        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "Transferencia fallida");
    }

    /// @notice Actualiza el monto del fee. Solo el owner puede llamarlo,
    ///         y no puede superar MAX_FEE.
    function setFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee excede el maximo permitido");
        uint256 oldFee = fee;
        fee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }

    /// @notice Actualiza la direccion de tesoreria. Solo el owner puede llamarlo.
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury invalida");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /// @notice Pausa el cobro de fees. Solo el owner puede llamarlo.
    ///         Uso pensado para emergencias (bug detectado post-deploy).
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Reanuda el cobro de fees. Solo el owner puede llamarlo.
    function unpause() external onlyOwner {
        _unpause();
    }
}
