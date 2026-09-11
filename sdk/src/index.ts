import { Contract, type ContractRunner, type BigNumberish } from "ethers";

import AttestationCoreAbi from "./abis/AttestationCore.json" with { type: "json" };
import FeeCollectorAbi from "./abis/FeeCollector.json" with { type: "json" };
import CrossChainRelayAbi from "./abis/CrossChainRelay.json" with { type: "json" };

/// Direcciones de los contratos desplegados, necesarias para instanciar el SDK.
export interface AttestifyConfig {
  attestationCoreAddress: string;
  feeCollectorAddress: string;
  crossChainRelayAddress?: string;
}

/// Datos necesarios para emitir una nueva attestation.
export interface IssueAttestationParams {
  schema: string;
  recipient: string;
  expirationTime?: BigNumberish;
  revocable?: boolean;
  data: string;
}

/// Representa una attestation ya emitida, tal como la devuelve el contrato.
export interface Attestation {
  uid: string;
  schema: string;
  attester: string;
  recipient: string;
  time: bigint;
  expirationTime: bigint;
  revocable: boolean;
  revoked: boolean;
  data: string;
}

/// Cliente principal del SDK de Attestify. Envuelve las llamadas a
/// AttestationCore y FeeCollector para simplificar la integracion.
export class Attestify {
  private readonly attestationCore: Contract;
  private readonly feeCollector: Contract;
  private readonly crossChainRelay?: Contract;

  constructor(config: AttestifyConfig, runner: ContractRunner) {
    this.attestationCore = new Contract(
      config.attestationCoreAddress,
      AttestationCoreAbi,
      runner
    );
    this.feeCollector = new Contract(
      config.feeCollectorAddress,
      FeeCollectorAbi,
      runner
    );
    if (config.crossChainRelayAddress) {
      this.crossChainRelay = new Contract(
        config.crossChainRelayAddress,
        CrossChainRelayAbi,
        runner
      );
    }
  }

  /// Devuelve el fee vigente (en wei) que hay que pagar por operacion.
  async getCurrentFee(): Promise<bigint> {
    return await this.feeCollector.fee();
  }

  /// Emite una nueva attestation, pagando automaticamente el fee vigente.
  /// Devuelve el uid de la attestation creada.
  async issueAttestation(params: IssueAttestationParams): Promise<string> {
    const fee = await this.getCurrentFee();

    const tx = await this.attestationCore.issueAttestation(
      params.schema,
      params.recipient,
      params.expirationTime ?? 0,
      params.revocable ?? true,
      params.data,
      { value: fee }
    );
    const receipt = await tx.wait();

    const event = receipt.logs
      .map((log: unknown) => {
        try {
          return this.attestationCore.interface.parseLog(log as never);
        } catch {
          return null;
        }
      })
      .find((e: { name: string } | null) => e?.name === "AttestationIssued");

    if (!event) {
      throw new Error("No se encontro el evento AttestationIssued en el recibo.");
    }

    return event.args.uid as string;
  }

  /// Revoca una attestation existente. Solo funciona si quien firma la
  /// transaccion es el emisor original y la attestation era revocable.
  async revokeAttestation(uid: string): Promise<void> {
    const tx = await this.attestationCore.revokeAttestation(uid);
    await tx.wait();
  }

  /// Obtiene los datos completos de una attestation por su uid.
  async getAttestation(uid: string): Promise<Attestation> {
    const result = await this.attestationCore.getAttestation(uid);
    return {
      uid: result.uid,
      schema: result.schema,
      attester: result.attester,
      recipient: result.recipient,
      time: result.time,
      expirationTime: result.expirationTime,
      revocable: result.revocable,
      revoked: result.revoked,
      data: result.data,
    };
  }

  /// Indica si una attestation es valida: existe, no fue revocada, y no expiro.
  async isValid(uid: string): Promise<boolean> {
    return await this.attestationCore.isValid(uid);
  }

  /// Consulta el costo (en wei, moneda nativa) de notificar una
  /// attestation a otra cadena via LayerZero. Requiere haber
  /// configurado crossChainRelayAddress al crear el cliente.
  async quoteCrossChainNotify(params: {
    dstEid: number;
    uid: string;
    schema: string;
    attester: string;
    recipient: string;
    options?: string;
  }): Promise<bigint> {
    if (!this.crossChainRelay) {
      throw new Error(
        "crossChainRelayAddress no fue configurado en este cliente Attestify."
      );
    }
    const fee = await this.crossChainRelay.quoteNotify(
      params.dstEid,
      params.uid,
      params.schema,
      params.attester,
      params.recipient,
      params.options ?? "0x"
    );
    return fee.nativeFee as bigint;
  }

  /// Notifica a otra cadena que una attestation fue emitida, pagando
  /// automaticamente el fee de LayerZero consultado previamente.
  /// Requiere haber configurado crossChainRelayAddress al crear el
  /// cliente.
  async notifyCrossChain(params: {
    dstEid: number;
    uid: string;
    schema: string;
    attester: string;
    recipient: string;
    options?: string;
  }): Promise<string> {
    if (!this.crossChainRelay) {
      throw new Error(
        "crossChainRelayAddress no fue configurado en este cliente Attestify."
      );
    }
    const options = params.options ?? "0x";
    const fee = await this.quoteCrossChainNotify({ ...params, options });

    const tx = await this.crossChainRelay.notifyAttestation(
      params.dstEid,
      params.uid,
      params.schema,
      params.attester,
      params.recipient,
      options,
      { value: fee }
    );
    const receipt = await tx.wait();
    return receipt.hash as string;
  }
}