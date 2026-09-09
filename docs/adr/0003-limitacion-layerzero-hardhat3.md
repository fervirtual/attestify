# ADR 0003: Limitacion de LayerZero con Hardhat 3 y estrategia de testing

## Estado
Aceptado

## Contexto
Al integrar LayerZero (ver ADR 0001) sobre el proyecto Hardhat 3 ya
establecido, surgieron varios problemas de compatibilidad reales del
ecosistema, no atribuibles a errores de configuracion propios:

1. El paquete `@layerzerolabs/oapp-evm` declara un campo `exports` en su
   `package.json` que solo permite importar `package.json` y artefactos
   ya compilados (`artifacts/*.json`), bloqueando la resolucion de
   imports de codigo fuente Solidity (`.sol`) que Hardhat 3 necesita
   para compilar. Esto rompe la importacion directa de sus contratos
   base (`OApp.sol`, etc).

2. El paquete alternativo `@layerzerolabs/lz-evm-oapp-v2` (nomenclatura
   anterior del mismo paquete) SI expone el codigo fuente sin
   restricciones de `exports`, y resulto ser la via funcional para
   importar los contratos base de OApp.

3. El toolkit oficial de testing de LayerZero
   (`@layerzerolabs/test-devtools-evm-hardhat`, hasta su version 0.5.3)
   declara como peer dependency `hardhat ^2.22.10`, sin soporte para
   Hardhat 3. Esto impide usar las herramientas oficiales para simular
   dos redes comunicandose localmente en tests.

4. El `EndpointV2Mock` provisto por LayerZero (dentro de
   `artifacts/EndpointV2Mock.sol/EndpointV2Mock.json`) es funcionalmente
   equivalente al Endpoint de produccion completo (requiere registrar
   librerias de mensajeria, verificacion, etc), por lo que no es un
   sustituto simple para testing aislado.

## Decision
- Se usa `@layerzerolabs/lz-evm-oapp-v2` (no `oapp-evm`) para importar
  los contratos base de OApp en `CrossChainRelay.sol`.
- Se construye un contrato propio y minimo, `EndpointStub.sol` (en
  `contracts/mocks/`), que implementa unicamente las funciones
  (`quote`, `send`, `setDelegate`) que `OApp` necesita para operar,
  sin replicar la logica real de verificacion/entrega de mensajes de
  LayerZero.
- Los tests locales de `CrossChainRelay` (`test/CrossChainRelay.ts`)
  usan este stub para validar: control de acceso (`_lzReceive` solo
  aceptable desde el endpoint configurado), cobro correcto del fee
  simulado, y emision de eventos.
- La validacion end-to-end real (un mensaje viajando efectivamente de
  una cadena a otra y siendo entregado) queda pendiente para la etapa
  de deploy en testnets reales (ver plan de seguridad por etapas),
  dado que replicar esa simulacion localmente sin el toolkit oficial
  implicaria construir un motor de mensajeria propio, con riesgo de
  no reflejar fielmente el comportamiento real de produccion.

## Alternativas consideradas
- **Usar `test-devtools-evm-hardhat` forzando con `--legacy-peer-deps`**:
  descartado porque la incompatibilidad no es solo de version declarada
  sino probablemente de arquitectura interna de plugins entre Hardhat 2
  y 3, con alto riesgo de fallas dificiles de diagnosticar.
- **Replicar el motor completo de mensajeria de LayerZero para testing
  local**: descartado por el costo de tiempo y el riesgo de que una
  replica casera no refleje el comportamiento real, dando una falsa
  sensacion de seguridad.
- **Esperar a que LayerZero soporte Hardhat 3 oficialmente**: descartado
  como bloqueante total; se opta por avanzar con el stub minimo y
  revisar este ADR cuando el ecosistema lo soporte.

## Consecuencias
- La cobertura de tests de `CrossChainRelay` es solida a nivel de
  logica propia (control de acceso, fees, eventos) pero NO valida el
  flujo real de entrega de mensajes cross-chain.
- Antes de cualquier deploy a mainnet, es obligatorio validar el flujo
  completo en testnets reales (por ejemplo, Sepolia y otra L2 testnet).
- Revisar periodicamente si `@layerzerolabs/test-devtools-evm-hardhat`
  lanza una version compatible con Hardhat 3, para reemplazar el stub
  casero por el toolkit oficial y ampliar la cobertura de tests locales.

## Actualizacion: validacion end-to-end completada
La brecha mencionada arriba (falta de validacion end-to-end real
entre dos cadenas) fue cerrada. Se desplego CrossChainRelay en una
segunda red real (Arbitrum Sepolia), se configuraron los peers, y se
envio y confirmo la entrega de un mensaje real desde Sepolia.

Detalle completo del proceso y resultado en
docs/guides/cross-chain-testing.md.