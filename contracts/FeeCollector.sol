// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title FeeCollector
/// @notice Cobra un fee fijo y configurable por cada operación registrada,
///         y lo transfiere automáticamente a una dirección de tesorería.
///         Ver docs/adr/0002-modelo-de-monetizacion.md para el contexto
///         de esta decisión.
contract FeeCollector is Ownable {
    /// @notice Monto del fee en wei, cobrado por cada operación.
    uint256 public fee;

    /// @notice Dirección que recibe los fees cobrados.
    address public treasury;

    event FeeCharged(address indexed payer, uint256 amount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    /// @param initialFee Monto inicial del fee, en wei.
    /// @param initialTreasury Dirección inicial que recibe los fees.
    constructor(uint256 initialFee, address initialTreasury)
        Ownable(msg.sender)
    {
        require(initialTreasury != address(0), "Treasury invalida");
        fee = initialFee;
        treasury = initialTreasury;
    }

    /// @notice Cobra el fee actual. Pensado para ser llamado desde el
    ///         contrato de attestations en cada emision/verificacion.
    function collectFee() external payable {
        require(msg.value >= fee, "Fee insuficiente");

        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "Transferencia fallida");

        emit FeeCharged(msg.sender, msg.value);
    }

    /// @notice Actualiza el monto del fee. Solo el owner puede llamarlo.
    function setFee(uint256 newFee) external onlyOwner {
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
}
