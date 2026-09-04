import { expect } from "chai";
import { network } from "hardhat";

describe("CrossChainRelay", function () {
  const DST_EID = 2;
  const SCHEMA = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const UID = "0x0000000000000000000000000000000000000000000000000000000000000042";

  async function deployFixture() {
    const { ethers } = await network.connect();
    const [owner, attester, recipient, other] = await ethers.getSigners();

    const EndpointStub = await ethers.getContractFactory("EndpointStub");
    const endpointStub = await EndpointStub.deploy();

    const CrossChainRelay = await ethers.getContractFactory("CrossChainRelay");
    const relay = await CrossChainRelay.deploy(
      await endpointStub.getAddress(),
      owner.address
    );

    return { relay, endpointStub, owner, attester, recipient, other, ethers };
  }

  describe("Deployment", function () {
    it("configura el owner correctamente", async function () {
      const { relay, owner } = await deployFixture();
      expect(await relay.owner()).to.equal(owner.address);
    });
  });

  describe("quoteNotify", function () {
    it("devuelve el fee simulado por el stub", async function () {
        const { relay, endpointStub, ethers, owner } = await deployFixture();
        const stubFee = await endpointStub.stubNativeFee();
  
        await relay
          .connect(owner)
          .setPeer(DST_EID, ethers.zeroPadValue(await relay.getAddress(), 32));
  
        const fee = await relay.quoteNotify(
        DST_EID,
        UID,
        SCHEMA,
        "0x00000000000000000000000000000000000000AA",
        "0x00000000000000000000000000000000000000BB",
        "0x"
      );

      expect(fee.nativeFee).to.equal(stubFee);
    });
  });

  describe("notifyAttestation", function () {
    it("emite AttestationNotified y llama al endpoint con el fee correcto", async function () {
        const { relay, endpointStub, ethers, owner, attester, recipient } = await deployFixture();
        const stubFee = await endpointStub.stubNativeFee();
  
        await relay
          .connect(owner)
          .setPeer(DST_EID, ethers.zeroPadValue(await relay.getAddress(), 32));
  
        await expect(
        relay
          .connect(attester)
          .notifyAttestation(
            DST_EID,
            UID,
            SCHEMA,
            attester.address,
            recipient.address,
            "0x",
            { value: stubFee }
          )
      )
        .to.emit(relay, "AttestationNotified")
        .withArgs(DST_EID, UID, SCHEMA, attester.address, recipient.address);
    });

    it("rechaza si no se paga el fee simulado por el stub", async function () {
      const { relay, ethers, attester, recipient } = await deployFixture();

      await expect(
        relay
          .connect(attester)
          .notifyAttestation(
            DST_EID,
            UID,
            SCHEMA,
            attester.address,
            recipient.address,
            "0x",
            { value: 0 }
          )
      ).to.be.revert(ethers);
    });
  });

  describe("_lzReceive (simulado)", function () {
    it("rechaza si quien llama no es el endpoint configurado", async function () {
      const { relay, ethers, other, attester, recipient } = await deployFixture();

      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32", "address", "address"],
        [UID, SCHEMA, attester.address, recipient.address]
      );

      const origin = {
        srcEid: DST_EID,
        sender: ethers.zeroPadValue(await relay.getAddress(), 32),
        nonce: 1,
      };

      await expect(
        relay
          .connect(other)
          .lzReceive(origin, ethers.ZeroHash, payload, other.address, "0x")
      ).to.be.revert(ethers);
    });
  });
});