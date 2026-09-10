# ADR 0004: Fee porcentual para attestations pagas

## Estado
Aceptado

## Contexto
El modelo de monetizacion actual (ADR 0002) cobra un fee fijo por cada
operacion en FeeCollector, independiente de cualquier valor monetario
asociado. Esto funciona para el caso general, pero no captura valor
cuando existe una transaccion economica real entre el emisor de una
credencial y su receptor (por ejemplo, una plataforma que cobra por
certificar a un usuario).

## Decision
Se agrega un mecanismo de fee porcentual (5%) que aplica
especificamente a attestations pagas, como modelo ADICIONAL al fee
fijo existente (no lo reemplaza):

- El emisor (attester) puede opcionalmente definir un precio en la
  emision de una attestation.
- El receptor (recipient) paga ese precio al momento de la emision.
- El contrato divide automaticamente el pago: 5% a la treasury de
  Attestify, 95% al emisor.
- El fee fijo de FeeCollector sigue aplicando a TODA attestation
  (pagada o no), como ingreso base independiente de este mecanismo.

Este es el escenario "B" que se dejo anotado como extension futura en
ADR 0002.

## Alternativas consideradas
- **Que pague el emisor en vez del receptor**: descartado porque
  convertiria el fee en un costo puro para el emisor, sin beneficio
  directo, desalentando la adopcion (mala propuesta de valor).
- **Reemplazar el fee fijo por el porcentual**: descartado porque el
  fee fijo sigue generando ingreso en credenciales gratuitas, que
  probablemente sean la mayoria del volumen inicial.

## Consecuencias
- Requiere modificar AttestationCore (o agregar un contrato nuevo)
  para soportar un flujo de pago con precio, split automatico, y
  transferencia al emisor.
- Aumenta la superficie de ataque del sistema (maneja transferencias
  de fondos entre dos partes, no solo hacia la treasury) - requiere
  el mismo ciclo de seguridad ya aplicado a los demas contratos
  (tests, Slither).
- El emisor debe confiar en que el contrato transfiera correctamente
  su 95% - esto debe quedar claramente auditable via eventos, igual
  que el resto del sistema.
- Queda pendiente definir: que pasa si el receptor no tiene fondos
  suficientes (revertir la emision, probablemente), y si el precio
  puede modificarse despues de fijado.