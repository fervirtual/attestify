# ADR 0002: Modelo de monetización

## Estado
Aceptado

## Contexto
Attestify se distribuye bajo licencia Apache 2.0 (ver ADR 0001 y LICENSE),
lo que permite uso, modificación y distribución libre, incluso comercial,
sin obligación de pago. Esto favorece la adopción masiva pero no genera
ingreso por sí solo. Es necesario definir un mecanismo de monetización
compatible con una licencia permisiva y con el objetivo de adopción amplia.

## Decisión
Se adoptan dos mecanismos complementarios:

1. **Fee automático por uso on-chain**: el smart contract cobra un monto
   pequeño (a definir, orden de centavos de dólar) por cada operación de
   emisión/verificación de attestation, independientemente de quién lo
   use. El fee se transfiere automáticamente a una wallet designada.
   Este mecanismo aplica a todos los usuarios por igual, sin distinción
   entre uso individual o empresarial, y está determinado por el propio
   protocolo, no por acuerdos comerciales caso a caso.

2. **Open core**: el framework base permanece abierto (Apache 2.0).
   Funcionalidades adicionales orientadas a uso empresarial (soporte
   dedicado, dashboards de administración, SLAs, integraciones a medida)
   se ofrecen como paquete separado y pago, fuera del alcance de la
   licencia abierta.

## Alternativas consideradas
- **Licencia restrictiva tipo BSL**: descartada porque introduce fricción
  para la adopción y puede alejar a parte de la comunidad open source,
  contradiciendo el objetivo principal de adopción masiva.
- **Depender solo de donaciones/sponsorship**: descartada por no ser un
  ingreso predecible ni escalable.

## Consecuencias
- El fee on-chain debe estar claramente documentado y visible en el
  código del contrato, de forma auditable por cualquier usuario o
  integrador, para mantener transparencia (ver también consideraciones
  legales pendientes de revisión).
- El desarrollo debe mantener una separación clara entre el core abierto
  y las eventuales features de la capa "enterprise", para no filtrar
  funcionalidades pagas al paquete open source por error.
- Queda pendiente definir el monto exacto del fee y validar
  implicancias legales/fiscales de recibir estos pagos automáticamente
  en una wallet personal.
