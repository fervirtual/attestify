# Guía: configurar la Safe multisig como treasury de Attestify

Esta guía documenta el proceso completo para crear una wallet Safe
(multisig) que sirva como treasury futura de Attestify, en reemplazo
de la wallet individual usada hasta ahora.

## Por qué una Safe en vez de una wallet individual

Con una wallet individual (como la usada hasta ahora para el deploy),
si se pierde o compromete la clave privada, se pierde el control de
los fondos para siempre. Una Safe requiere que un numero minimo de
"firmantes" (cuentas separadas) aprueben cualquier movimiento —
perder una sola clave no es catastrofico si hay mas firmantes.

## Paso 1: crear las cuentas firmantes en MetaMask

Se crearon dos cuentas nuevas y separadas:

1. **"Attestify Treasury"** — en la extension de MetaMask de la compu.
2. **"Attestify Treasury - Signer 2"** — en una wallet nueva e
   independiente (frase de recuperacion propia, no importada),
   instalada en el celular.

Importante: crear la segunda cuenta con una frase de recuperacion
*distinta* a la primera es lo que da la proteccion real — si se
importa la misma frase en dos dispositivos, es la misma clave
duplicada, no dos claves separadas.

## Paso 2: crear la Safe en app.safe.global

1. Ir a app.safe.global, conectar con la wallet "Attestify Treasury".
2. Pestana "My accounts" (no "Workspaces", que es una capa nueva de
   pago no necesaria para esto).
3. "Add accounts" → "Create new".
4. Nombre: "Attestify Treasury".
5. Red: solo Sepolia (se descarto Ethereum mainnet por ahora, ya que
   todo el proyecto sigue en etapa de testnet).
6. Signers: se dejo la cuenta conectada como unico firmante por
   ahora (threshold 1 de 1) — el segundo firmante se agrega
   despues, en un paso separado (ver mas abajo, pendiente).
7. Pago del fee de activacion: se eligio "Pay later" (se suma a la
   primera transaccion real, en vez de pagarlo aparte al crear la
   Safe).

Direccion de la Safe creada: `0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760`

## Paso 3: fondear las cuentas necesarias

Dos transferencias de ETH de Sepolia, ambas desde la wallet de deploy
original (que ya tenia fondos):

1. **A la Safe misma** (0.005 ETH) — para futuras operaciones reales.
   Script: `scripts/fund-safe.ts`.
2. **A la cuenta firmante individual "Attestify Treasury"** (0.005 ETH)
   — necesario porque el fee de gas para activar/operar la Safe se
   paga desde la cuenta firmante, NO desde el balance de la Safe.
   Este paso no era obvio al principio: el primer intento de
   activacion fallo con "Your connected wallet doesn't have enough
   funds" porque la cuenta firmante individual tenia 0 ETH, aunque la
   Safe ya tuviera fondos. Script: `scripts/fund-signer.ts`.

## Paso 4: activar la Safe en Sepolia

En el dashboard de la Safe (app.safe.global), aparece "Activate your
Safe account" con dos pasos: "First interaction" (automatico) y
"Activate account on Sepolia" (requiere una transaccion real,
pagada por la cuenta firmante).

### Problema encontrado: MetaMask no mostraba Sepolia

La red "Sepolia" no aparecia en el selector de redes de MetaMask,
aunque ya se habia usado Sepolia antes en el proyecto (via Hardhat).
Causa: la opcion "Mostrar redes de prueba" estaba desactivada en la
configuracion de MetaMask.

Solucion encontrada: en vez de buscar el toggle directamente (la
interfaz de MetaMask cambio de estructura respecto a versiones
anteriores y no fue facil encontrarlo por navegacion manual), se
intento "Agregar una red personalizada" escribiendo "Sepolia" — esto
mostro un aviso de que la red ya existia con ese Chain ID, con un
link "editar la red original". Al entrar ahi y guardar (sin cambiar
nada), el toggle "Mostrar redes de prueba" se activo automaticamente
y Sepolia paso a estar visible.

### Cambio de red automatico

Una vez que Sepolia estaba disponible, no hizo falta cambiarla
manualmente en MetaMask: al confirmar la transaccion en Safe, esta
misma detecto que la red no coincidia y mostro un boton "Switch to
Sepolia" que hizo el cambio automaticamente via MetaMask, pidiendo
solo una confirmacion de permisos.

## Estado actual

Safe creada, fondeada, y **activada correctamente** en Sepolia.
Direccion: `0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760`.

Un solo firmante configurado (threshold 1 de 1) — no es multisig
real todavia.

## Pendiente

- [ ] Agregar la cuenta "Attestify Treasury - Signer 2" (celular) como
  segundo firmante, y actualizar el threshold (por ejemplo, a 2 de 2,
  o 1 de 2 segun el nivel de friccion deseado).
- [ ] Migrar la treasury de FeeCollector hacia esta Safe, llamando
  `setTreasury()` desde la wallet de deploy actual (owner del
  contrato).
- [ ] Crear la Safe equivalente en Ethereum mainnet cuando el
  proyecto este listo para produccion real, con un segundo firmante
  desde el inicio (no como agregado posterior).