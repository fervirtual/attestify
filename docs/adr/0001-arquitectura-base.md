# ADR 0001: Arquitectura base de Attestify

## Estado
Aceptado

## Contexto
Attestify busca ser una capa de credenciales/attestations verificables e
interoperable entre blockchains. Es necesario definir sobre qué red(es)
construir inicialmente y qué mecanismo usar para la comunicación cross-chain.

## Decisión
- **Red base**: Ethereum mainnet, con Arbitrum y Optimism como L2s iniciales.
  Se elige Ethereum porque ahí vive EAS (Ethereum Attestation Service), el
  estándar de attestations más maduro del ecosistema, y Attestify busca
  construir interoperabilidad sobre ese estándar en vez de competir contra él.
- **Capa de mensajería cross-chain**: LayerZero. Se elige por ser la opción
  con más adopción y precedentes de proyectos de identidad/credenciales
  construidos sobre ella, lo que reduce el riesgo de reinventar patrones
  de seguridad ya resueltos.
- **Extensión futura**: se contempla agregar soporte para Solana vía
  Wormhole más adelante, sin que esto requiera rediseñar la arquitectura
  base.

## Alternativas consideradas
- **Chainlink CCIP**: descartado por ahora por mayor overhead de
  integración inicial, aunque queda como opción a reevaluar.
- **Wormhole como mensajería principal**: descartado como opción inicial
  porque su fortaleza está más en ecosistemas no-EVM; se reserva para la
  fase de extensión a Solana.

## Consecuencias
- El desarrollo inicial se concentra en el ecosistema EVM.
- La lógica de negocio (credenciales) debe mantenerse desacoplada del
  transporte (LayerZero), para poder cambiar o agregar capas de mensajería
  sin reescribir el core.
