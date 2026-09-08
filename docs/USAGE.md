# Uso de Attestify

Esta guia muestra como integrar el SDK de Attestify (`sdk/`) en un
proyecto propio para emitir, revocar y consultar credenciales
verificables.

## Instalacion

> El paquete todavia no esta publicado en npm (ver estado del proyecto
> en el README). Por ahora, se usa localmente apuntando a la carpeta
> `sdk/` del repo, o copiando `sdk/dist` una vez compilado con
> `npm run build`.

```bash
npm install ethers
```

## Inicializacion

El SDK necesita las direcciones de los contratos ya desplegados
(`AttestationCore` y `FeeCollector`), y un `Signer` o `Provider` de
ethers para interactuar con la blockchain.

```typescript
import { ethers } from "ethers";
import { Attestify } from "attestify";

const provider = new ethers.JsonRpcProvider("https://tu-rpc-aqui");
const signer = new ethers.Wallet("TU_CLAVE_PRIVADA", provider);

const attestify = new Attestify(
  {
    attestationCoreAddress: "0x...",
    feeCollectorAddress: "0x...",
  },
  signer
);
```

## Emitir una attestation

El fee vigente se calcula y paga automaticamente — no hace falta
consultarlo ni manejarlo manualmente.

```typescript
const uid = await attestify.issueAttestation({
  schema: "0x...", // identificador del tipo de credencial
  recipient: "0xDireccionDelReceptor",
  expirationTime: 0, // 0 = no expira
  revocable: true,
  data: "0x...", // contenido de la credencial, codificado
});

console.log("Attestation creada:", uid);
```

## Consultar una attestation

```typescript
const attestation = await attestify.getAttestation(uid);
console.log(attestation);
```

## Verificar si una attestation es valida

Devuelve `false` si la attestation no existe, fue revocada, o expiro.

```typescript
const valida = await attestify.isValid(uid);
```

## Revocar una attestation

Solo funciona si quien firma la transaccion es el emisor original de
la attestation, y esta fue creada como revocable.

```typescript
await attestify.revokeAttestation(uid);
```

## Notas

- La mensajeria cross-chain (`CrossChainRelay`) todavia no esta
  expuesta en el SDK — se agregara en una proxima iteracion (ver
  `docs/adr/0003-limitacion-layerzero-hardhat3.md` para el contexto de
  su estado actual).
- Este SDK esta en una etapa temprana (v0.1.0): la interfaz puede
  cambiar antes de una version 1.0 estable.
