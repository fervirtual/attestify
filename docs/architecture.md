# Arquitectura de Attestify

## Visión general

Attestify es una capa de credenciales y attestations verificables,
diseñada para ser interoperable entre múltiples blockchains. El objetivo
es que una credencial emitida en una cadena pueda ser verificada desde
cualquier otra, sin depender de la plataforma original que la emitió.

## Componentes principales

- **Capa de attestations**: construida sobre EAS (Ethereum Attestation
  Service) como estándar base en Ethereum y sus L2s.
- **Capa de mensajería cross-chain**: LayerZero, encargada de transportar
  la información de attestations entre cadenas de forma segura.
- **Capa de fee/monetización**: mecanismo on-chain que cobra un monto
  pequeño por cada operación de emisión/verificación (ver ADR 0002).
- **SDK para developers**: interfaz que las plataformas (como HackChain)
  usarán para integrar Attestify sin tener que lidiar directamente con
  la complejidad de cada cadena.

## Decisiones de diseño

Ver el detalle y las razones de cada decisión en:
- [`docs/adr/0001-arquitectura-base.md`](adr/0001-arquitectura-base.md) — elección de red base y mensajería cross-chain
- [`docs/adr/0002-modelo-de-monetizacion.md`](adr/0002-modelo-de-monetizacion.md) — modelo de fee automático + open core

## Principios de diseño

- **Desacople entre lógica de negocio y transporte**: la lógica de
  credenciales no debe depender directamente de LayerZero, para poder
  cambiar o agregar capas de mensajería sin reescribir el core.
- **Transparencia por diseño**: el fee cobrado debe ser visible y
  auditable directamente en el contrato, no oculto en documentación
  aparte.
- **Extensibilidad hacia ecosistemas no-EVM**: la arquitectura contempla
  agregar soporte para Solana (vía Wormhole) sin rediseño mayor.

## Estado actual

Diseño inicial. Sin código funcional publicado aún.
