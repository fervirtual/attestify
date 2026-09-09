# Guia: probar el flujo cross-chain real (Sepolia <-> Arbitrum Sepolia)

Esta guia documenta el proceso completo para validar que CrossChainRelay
funciona de verdad entre dos redes distintas, no solo en tests locales.

## Por que hace falta una segunda red

Los tests locales (test/CrossChainRelay.ts) usan un stub casero
(EndpointStub.sol) que simula el comportamiento de LayerZero, pero
nunca prueban que un mensaje viaje realmente de una blockchain a otra.
Para eso, se necesita desplegar en dos redes reales y enviar un
mensaje real entre ellas.

## Paso 1: elegir la segunda red y su Endpoint de LayerZero

Se eligio Arbitrum Sepolia (ya comprometida en el ADR 0001). La
direccion del Endpoint V2 de LayerZero se busca en:

https://docs.layerzero.network/v2/deployments/deployed-contracts

Dato interesante: LayerZero despliega su Endpoint V2 en la MISMA
direccion en muchas redes EVM distintas (usa CREATE2), asi que Sepolia
y Arbitrum Sepolia comparten la direccion:
`0x6EDCE65403992e310A62460808c4b910D972f10f`

## Paso 2: conseguir fondos de testnet en la segunda red

### Intento 1: faucets tradicionales (fallaron)

Varios faucets (Alchemy, QuickNode, Chainlink) piden que la wallet
tenga un pequeño balance en la red MAINNET real (ETH o LINK) para
evitar abuso del servicio. Como la wallet de testing es nueva y sin
fondos reales (correcto, no deberia tenerlos), estos faucets rechazan
la solicitud.

### Solucion que funciono: puente (bridge) oficial

En vez de pedir fondos nuevos, se puentearon fondos que ya se tenian
en Sepolia hacia Arbitrum Sepolia:

1. Ir a https://bridge.arbitrum.io
2. Activar "Testnet mode" (toggle, generalmente en el footer/settings)
3. Elegir origen "Sepolia" y destino "Arbitrum Sepolia"
4. Ingresar el monto (0.01 ETH fue suficiente)
5. Conectar MetaMask (la wallet de testing) y confirmar
6. Esperar ~10 minutos (el puente cruza dos redes reales)

## Paso 3: habilitar la red en Alchemy

En dashboard.alchemy.com, dentro de la app ya creada:
1. Ir a la seccion de "Networks" de esa app
2. Buscar "Arbitrum" -> activar especificamente "Arbitrum Sepolia"
   (no "Arbitrum Mainnet")
3. Copiar el HTTPS URL generado

## Paso 4: agregar la variable al .env

Se agrega una nueva variable, reusando la misma clave privada de
siempre (la wallet de testing es la misma en todas las redes EVM):