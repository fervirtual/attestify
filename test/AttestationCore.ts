import { expect } from "chai";
import { network } from "hardhat";

describe("AttestationCore", function () {
  const FEE = 1_000_000_000_000n; // misma que usamos en FeeCollector
  const SCHEMA = "0x0000000000000000000000000000000000000000000000000000000000000001";

  async function deployFixture() {
    const { ethers } = await network.connect();
    const [owner, treasury, attester, recipient, other] = await ethers.getSigners();

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.deploy(FEE, treasury.address);

    const AttestationCoreFactory = await ethers.getContractFactory("AttestationCore");
    const attestationCore = await AttestationCoreFactory.deploy(
      await feeCollector.getAddress()
    );

    return { feeCollector, attestationCore, owner, treasury, attester, recipient, other, ethers };
  }

  describe("Deployment", function () {
    it("configura el feeCollector correctamente", async function () {
      const { attestationCore, feeCollector } = await deployFixture();
      expect(await attestationCore.feeCollector()).to.equal(
        await feeCollector.getAddress()
      );
    });

    it("rechaza feeCollector en address(0)", async function () {
      const { ethers } = await network.connect();
      const AttestationCoreFactory = await ethers.getContractFactory("AttestationCore");
      await expect(
        AttestationCoreFactory.deploy("0x0000000000000000000000000000000000000000")
      ).to.be.revertedWith("FeeCollector invalido");
    });
  });

  describe("issueAttestation", function () {
    it("emite una attestation correctamente y cobra el fee", async function () {
      const { attestationCore, attester, recipient, treasury } = await deployFixture();

      const treasuryBalanceBefore = await treasury.provider.getBalance(treasury.address);

      const tx = await attestationCore
        .connect(attester)
        .issueAttestation(SCHEMA, recipient.address, 0, true, "0x1234", { value: FEE });
      await tx.wait();

      const treasuryBalanceAfter = await treasury.provider.getBalance(treasury.address);
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(FEE);
    });

    it("emite el evento AttestationIssued", async function () {
      const { attestationCore, attester, recipient } = await deployFixture();
      await expect(
        attestationCore
          .connect(attester)
          .issueAttestation(SCHEMA, recipient.address, 0, true, "0x1234", { value: FEE })
      ).to.emit(attestationCore, "AttestationIssued");
    });

    it("rechaza recipient en address(0)", async function () {
      const { attestationCore, attester } = await deployFixture();
      await expect(
        attestationCore
          .connect(attester)
          .issueAttestation(
            SCHEMA,
            "0x0000000000000000000000000000000000000000",
            0,
            true,
            "0x1234",
            { value: FEE }
          )
      ).to.be.revertedWith("Recipient invalido");
    });

    it("rechaza si no se paga el fee", async function () {
      const { attestationCore, ethers, attester, recipient } = await deployFixture();
      await expect(
        attestationCore
          .connect(attester)
          .issueAttestation(SCHEMA, recipient.address, 0, true, "0x1234", {
            value: FEE - 1n,
          })
      ).to.be.revert(ethers);
    });
  });

  describe("revokeAttestation", function () {
    async function issueFixture() {
      const base = await deployFixture();
      const tx = await base.attestationCore
        .connect(base.attester)
        .issueAttestation(SCHEMA, base.recipient.address, 0, true, "0x1234", {
          value: FEE,
        });
      const receipt = await tx.wait();
      const event = receipt!.logs
        .map((log: any) => {
          try {
            return base.attestationCore.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e && e.name === "AttestationIssued");
      const uid = event!.args.uid;
      return { ...base, uid };
    }

    it("permite al emisor revocar", async function () {
      const { attestationCore, attester, uid } = await issueFixture();
      await attestationCore.connect(attester).revokeAttestation(uid);
      const attestation = await attestationCore.getAttestation(uid);
      expect(attestation.revoked).to.equal(true);
    });

    it("rechaza revocar si no es el emisor", async function () {
      const { attestationCore, ethers, other, uid } = await issueFixture();
      await expect(
        attestationCore.connect(other).revokeAttestation(uid)
      ).to.be.revert(ethers);
    });

    it("rechaza revocar dos veces", async function () {
      const { attestationCore, ethers, attester, uid } = await issueFixture();
      await attestationCore.connect(attester).revokeAttestation(uid);
      await expect(
        attestationCore.connect(attester).revokeAttestation(uid)
      ).to.be.revert(ethers);
    });

    it("rechaza revocar una attestation no revocable", async function () {
      const { attestationCore, ethers, attester, recipient } = await deployFixture();
      const tx = await attestationCore
        .connect(attester)
        .issueAttestation(SCHEMA, recipient.address, 0, false, "0x1234", {
          value: FEE,
        });
      const receipt = await tx.wait();
      const event = receipt!.logs
        .map((log: any) => {
          try {
            return attestationCore.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e && e.name === "AttestationIssued");
      const uid = event!.args.uid;

      await expect(
        attestationCore.connect(attester).revokeAttestation(uid)
      ).to.be.revert(ethers);
    });
  });

  describe("isValid", function () {
    it("devuelve true para una attestation valida", async function () {
      const { attestationCore, attester, recipient } = await deployFixture();
      const tx = await attestationCore
        .connect(attester)
        .issueAttestation(SCHEMA, recipient.address, 0, true, "0x1234", {
          value: FEE,
        });
      const receipt = await tx.wait();
      const event = receipt!.logs
        .map((log: any) => {
          try {
            return attestationCore.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e && e.name === "AttestationIssued");
      const uid = event!.args.uid;

      expect(await attestationCore.isValid(uid)).to.equal(true);
    });

    it("devuelve false para una attestation que no existe", async function () {
      const { attestationCore } = await deployFixture();
      expect(
        await attestationCore.isValid(
          "0x0000000000000000000000000000000000000000000000000000000000000099"
        )
      ).to.equal(false);
    });
  });

  describe("setFeeCollector", function () {
    it("permite al owner actualizar el feeCollector", async function () {
      const { attestationCore, feeCollector, owner } = await deployFixture();
      await attestationCore.connect(owner).setFeeCollector(await feeCollector.getAddress());
      expect(await attestationCore.feeCollector()).to.equal(await feeCollector.getAddress());
    });

    it("rechaza que alguien que no es el owner actualice el feeCollector", async function () {
      const { attestationCore, ethers, feeCollector, other } = await deployFixture();
      await expect(
        attestationCore.connect(other).setFeeCollector(await feeCollector.getAddress())
      ).to.be.revert(ethers);
    });
  });
});