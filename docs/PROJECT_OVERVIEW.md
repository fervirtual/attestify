# Attestify — resumen completo del proyecto

*[English version](en/PROJECT_OVERVIEW.md)*

Este documento resume todo el proyecto en un solo lugar: que es, por
que existe, como esta construido, y en que estado se encuentra hoy.
Pensado para compartir con alguien que evalue el proyecto desde
afuera, o como referencia propia.

## Que es Attestify

Un framework de credenciales verificables ("attestations") que
funciona de forma interoperable entre distintas blockchains. Permite
emitir, verificar y revocar credenciales on-chain, con dos modelos de
uso: gratuito y pago (con reparto automatico de ingresos entre la
plataforma y quien emite la credencial).

## El problema que resuelve

Hoy, una credencial emitida en una plataforma (por ejemplo, una
certificacion de seguridad en HackChain) vive aislada ahi. Si otra
plataforma, empleador, o protocolo quisiera verificar esa credencial,
no tiene una forma estandar de hacerlo sin depender directamente del
sistema original. Attestify busca ser la capa de interoperabilidad
que resuelve esto, apoyandose en el estandar EAS (Ethereum Attestation
Service) y extendiendolo a multiples cadenas.

## Por que este enfoque, y no otro

- **Sin token propio**: las fundaciones y comites de grants
  (Ethereum, Arbitrum, Optimism, etc.) suelen descartar
  sistematicamente proyectos dependientes de tokenomics
  especulativos. Attestify se financia con fees de protocolo, no con
  preventas de token.
- **Chain-agnostic desde el diseno**: en vez de construir puentes
  cross-chain propios (una fuente historica de hacks graves en el
  ecosistema), se usa LayerZero como capa de mensajeria ya probada.

## Arquitectura tecnica

3 contratos principales, cada uno con una responsabilidad clara:

1. **FeeCollector**: cobra un fee fijo (ajustable, hoy ~5 centavos de
   USD) por cada operacion. Con tope maximo hardcodeado y capacidad
   de pausa de emergencia.
2. **AttestationCore**: registro de credenciales. Soporta emision
   gratuita y paga (con reparto 95%/5% entre emisor y plataforma),
   revocacion, y consulta de validez.
3. **CrossChainRelay**: notifica la emision de attestations a otras
   cadenas via LayerZero, para reflejar credenciales entre redes.

Cada decision de arquitectura importante esta documentada como ADR
(Architecture Decision Record) en `docs/adr/`, con el contexto,
alternativas consideradas, y consecuencias de cada una.

## Estado de seguridad

- 40+ tests automatizados cubriendo casos de exito y de ataque
  (control de acceso, limites, reentrancy).
- Analisis estatico con Slither aplicado a cada contrato, con
  correcciones documentadas.
- Proteccion contra reentrancy en las funciones que manejan
  transferencias a terceros.
- Pendiente antes de mainnet: auditoria de seguridad externa
  profesional (no reemplazable por herramientas automaticas cuando
  hay fondos reales en juego).

## Estado de deployment

- **Sepolia (testnet)**: los 3 contratos desplegados y **verificados
  publicamente** en Etherscan, Blockscout y Sourcify - el codigo
  fuente es auditable por cualquiera, no hay que confiar en la
  palabra del equipo.
- **Arbitrum Sepolia (testnet)**: CrossChainRelay desplegado para
  validar el flujo cross-chain real.
- **Validacion end-to-end real**: se envio un mensaje real desde
  Sepolia, se confirmo su entrega en Arbitrum Sepolia (evento
  decodificado correctamente), demostrando que la interoperabilidad
  cross-chain funciona en la practica, no solo en teoria.
- **Mainnet**: todavia no desplegado (ver roadmap).

## Modelo de negocio

Dos fuentes de ingreso combinadas:

1. **Fee fijo** en toda attestation (gratuita o paga) - ingreso base
   garantizado por volumen de uso.
2. **Fee porcentual (5%)** adicional, solo quando la credencial tiene
   un precio puesto por el emisor - el receptor paga ese precio, el
   contrato reparte automaticamente 95% al emisor y 5% a la
   plataforma.

Sin dependencia de un token propio ni de especulacion.

## SDK

Paquete de TypeScript que envuelve las llamadas a los contratos en
funciones simples (`issueAttestation`, `revokeAttestation`,
`getAttestation`, `isValid`), con sincronizacion automatica de ABIs
entre los contratos y el SDK para evitar desincronizacion.

## Lo que falta antes de un lanzamiento real

- Auditoria de seguridad externa profesional.
- Primer caso de uso real integrado (evaluando HackChain como
  candidato natural, dado el contexto de quien desarrollo el
  proyecto).
- Ampliar el SDK para exponer la funcionalidad cross-chain.
- Deploy en mainnet, con la treasury migrada a una wallet multisig
  (no una wallet individual) por seguridad.

## Enlaces

- Repositorio: https://github.com/fervirtual/attestify
- Documentacion tecnica completa: `docs/`