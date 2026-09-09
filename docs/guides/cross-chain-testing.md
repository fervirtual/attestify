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
tenga un pequeno balance en la red MAINNET real (ETH o LINK) para
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

ARBITRUM_SEPOLIA_RPC_URL=<url de alchemy>


## Paso 5: agregar la red a hardhat.config.ts

Dentro del bloque `networks`, se agrega una entrada nueva:

```typescript
arbitrumSepolia: {
  type: "http",
  chainType: "l1",
  url: configVariable("ARBITRUM_SEPOLIA_RPC_URL"),
  accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
},
```

## Tecnica: verificar un balance en cualquier red via consola

Util para confirmar que los fondos llegaron, sin depender de que
MetaMask este mostrando la red correcta en su interfaz:

```bash
npx hardhat console --network arbitrumSepolia
```

Dentro de la consola, linea por linea (Hardhat 3 no inyecta `ethers`
como variable global automatica, hay que obtenerlo explicitamente):

```javascript
const hardhat = await import("hardhat");
const { ethers } = await hardhat.default.network.connect();
const [signer] = await ethers.getSigners();
const balance = await ethers.provider.getBalance(signer.address);
console.log(signer.address, ethers.formatEther(balance));
```

Esto consulta directamente la blockchain real (via el RPC configurado
para esa red) y muestra el balance exacto - mas confiable que mirar
la interfaz visual de MetaMask, que depende de tener la red correcta
seleccionada ahi.

## Paso 6: desplegar CrossChainRelay en la segunda red

No hace falta desplegar FeeCollector ni AttestationCore en la segunda
red para esta prueba puntual - solo CrossChainRelay, con un modulo de
Ignition separado (ignition/modules/CrossChainRelayArbitrum.ts).

```bash
npx hardhat ignition deploy ignition/modules/CrossChainRelayArbitrum.ts --network arbitrumSepolia
```

## Paso 7: configurar setPeer en ambos contratos

Script: `scripts/cross-chain/setup-peers.ts`

```bash
npx hardhat run scripts/cross-chain/setup-peers.ts --network sepolia
```

Configura, en una sola corrida, el peer en ambas direcciones (el
script se conecta explicitamente a cada red por su cuenta).

## Paso 8: enviar un mensaje real desde Sepolia

Script: `scripts/cross-chain/send-cross-chain-message.ts`

```bash
npx hardhat run scripts/cross-chain/send-cross-chain-message.ts --network sepolia
```

Esto llama a `notifyAttestation`, pagando el fee de LayerZero
consultado previamente con `quoteNotify`. El script devuelve un hash
de transaccion que se puede rastrear en:

https://layerzeroscan.com (asegurarse de cambiar el selector de
"MAINNET" a "TESTNET" arriba a la izquierda, sino no encuentra la
transaccion).

## Paso 9: confirmar la recepcion en destino

Script: `scripts/cross-chain/check-cross-chain-receipt.ts`

```bash
npx hardhat run scripts/cross-chain/check-cross-chain-receipt.ts --network arbitrumSepolia
```

### Limitacion importante de Alchemy (plan gratuito)

El metodo `eth_getLogs` esta limitado a un rango de **10 bloques por
consulta** en el plan gratuito de Alchemy. Como Arbitrum genera
bloques muy rapido (~250ms cada uno), buscar eventos recientes
requiere recorrer hacia atras en bloques de 10, no se puede pedir un
rango grande de una sola vez. El script ya maneja esto automaticamente
(recorre hasta 3000 iteraciones de 10 bloques = ~30000 bloques de
historial).

Si el error dice `"UnknownError: Received an unexpected status
code..."` sin mas detalle, es probable que sea este limite - para ver
el mensaje real de Alchemy, hay que hacer la consulta con `fetch`
directo al RPC en vez de a traves de Hardhat/ethers, que oculta el
cuerpo del error en varias capas.

## Resultado: validacion exitosa

Mensaje enviado desde Sepolia, entregado en Arbitrum Sepolia,
confirmado por evento `AttestationReceived`:

srcEid: 40161 (Sepolia)
uid: 0x0000000000000000000000000000000000000000000000000000000000000099
schema: 0x0000000000000000000000000000000000000000000000000000000000000001
attester: 0x8A2030E0657fa7013E686da1CEE823Eb2536973B
recipient: 0x8A2030E0657fa7013E686da1CEE823Eb2536973B
tx hash (destino): 0x39d4e344b5253c06eecde046c13b6f55d84ac2bb7b03eb8dabe1187ff05adfef
Tiempo de entrega: ~1m 27s (segun LayerZeroScan)


Esto confirma que CrossChainRelay funciona correctamente entre dos
redes reales, cerrando la brecha de validacion documentada en
ADR 0003.

## Direcciones de los deployments usados en esta prueba

- CrossChainRelay en Sepolia: `0xc958482AF6c74C16A26e41F8864998f7ea4E9B7E`
- CrossChainRelay en Arbitrum Sepolia: `0xA73EB3aAcE334FFF3b910AdF40AbFF4bB25E93dD`
  (nota: coincide con la direccion del primer intento de deploy en
  Sepolia, por una coincidencia de nonce - ver seccion tecnica abajo)

## Nota tecnica: coincidencia de direcciones entre redes

La direccion de un contrato nuevo se calcula a partir de la direccion
de quien lo despliega y su nonce (numero de transaccion), sin
depender de en que red se despliega. Como el CrossChainRelay en
Arbitrum Sepolia fue la primera transaccion de la wallet de deploy en
esa red (nonce 0), coincidio exactamente con la direccion del primer
intento de deploy en Sepolia (que tambien fue nonce 0 ahi en su
momento). Es un comportamiento esperado, no un error.

## Leccion aprendida sobre heredocs en esta terminal

Los bloques `cat > archivo << 'EOF' ... EOF` largos, pegados en la
terminal de Git Bash dentro de Cursor, tienden a corromperse quedando
con contenido mezclado o truncado. Para archivos de configuracion o
codigo, es mas confiable editar directamente en el editor de Cursor
(crear el archivo, pegar el contenido, Ctrl+S) en vez de usar heredocs
por terminal.