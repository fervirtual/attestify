# Safe multisig - Treasury de Attestify

## Direccion

`0xE7c9FA81c47C6036C2812d0c75Ef9202a2b21760`

## Red

Sepolia (testnet)

## Configuracion actual

- Firmantes: 1 (Attestify Treasury - cuenta de MetaMask dedicada)
- Umbral: 1 de 1
- Balance actual: 0.005 ETH (Sepolia) - transferido desde la wallet de
  deploy para cubrir el fee de activacion

## Pendiente

- Agregar un segundo firmante para tener proteccion real de multisig
  (hoy funciona como wallet individual, no como multisig real, hasta
  sumar mas firmantes).
- Migrar la treasury de FeeCollector (llamando setTreasury()) desde la
  wallet de deploy actual hacia esta Safe, cuando este lista.
- Crear la Safe equivalente en Ethereum mainnet cuando el proyecto
  este listo para produccion real.