import { expect } from "chai";
import { network } from "hardhat";

describe("FeeCollector", function () {
  const INITIAL_FEE = 1_000_000_000_000n; // 0.000001 ETH
  const MAX_FEE = 10_000_000_000_000_000n; // 0.01 ETH

  async function deployFixture() {
    const { ethers } = await network.connect();
    const [owner, treasury, other] = await ethers.getSigners();

    const FeeCollector = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollector.deploy(
      INITIAL_FEE,
      treasury.address
    );

    return { feeCollector, owner, treasury, other, ethers };
  }

  describe("Deployment", function () {
    it("configura el fee y treasury iniciales correctamente", async function () {
      const { feeCollector, treasury } = await deployFixture();
      expect(await feeCollector.fee()).to.equal(INITIAL_FEE);
      expect(await feeCollector.treasury()).to.equal(treasury.address);
    });

    it("rechaza treasury en address(0)", async function () {
      const { ethers } = await network.connect();
      const FeeCollector = await ethers.getContractFactory("FeeCollector");
      await expect(
        FeeCollector.deploy(INITIAL_FEE, "0x0000000000000000000000000000000000000000")
      ).to.be.revertedWith("Treasury invalida");
    });

    it("rechaza un fee inicial mayor a MAX_FEE", async function () {
      const { ethers } = await network.connect();
      const [, treasury] = await ethers.getSigners();
      const FeeCollector = await ethers.getContractFactory("FeeCollector");
      await expect(
        FeeCollector.deploy(MAX_FEE + 1n, treasury.address)
      ).to.be.revertedWith("Fee excede el maximo permitido");
    });
  });

  describe("collectFee", function () {
    it("acepta el pago exacto del fee y lo transfiere a treasury", async function () {
      const { feeCollector, treasury, other } = await deployFixture();

      const treasuryBalanceBefore = await treasury.provider.getBalance(
        treasury.address
      );

      await feeCollector.connect(other).collectFee({ value: INITIAL_FEE });

      const treasuryBalanceAfter = await treasury.provider.getBalance(
        treasury.address
      );

      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(
        INITIAL_FEE
      );
    });

    it("acepta un pago mayor al fee minimo", async function () {
      const { feeCollector, ethers, other } = await deployFixture();
      await expect(
        feeCollector.connect(other).collectFee({ value: INITIAL_FEE * 2n })
      ).to.not.be.revert(ethers);
    });

    it("rechaza un pago menor al fee", async function () {
      const { feeCollector, other } = await deployFixture();
      await expect(
        feeCollector.connect(other).collectFee({ value: INITIAL_FEE - 1n })
      ).to.be.revertedWith("Fee insuficiente");
    });

    it("emite el evento FeeCharged", async function () {
      const { feeCollector, other } = await deployFixture();
      await expect(
        feeCollector.connect(other).collectFee({ value: INITIAL_FEE })
      )
        .to.emit(feeCollector, "FeeCharged")
        .withArgs(other.address, INITIAL_FEE);
    });

    it("rechaza el cobro mientras el contrato esta pausado", async function () {
      const { feeCollector, ethers, owner, other } = await deployFixture();
      await feeCollector.connect(owner).pause();
      await expect(
        feeCollector.connect(other).collectFee({ value: INITIAL_FEE })
      ).to.be.revert(ethers);
    });
  });

  describe("setFee", function () {
    it("permite al owner actualizar el fee", async function () {
      const { feeCollector, owner } = await deployFixture();
      const newFee = INITIAL_FEE * 2n;
      await feeCollector.connect(owner).setFee(newFee);
      expect(await feeCollector.fee()).to.equal(newFee);
    });

    it("rechaza que alguien que no es el owner actualice el fee", async function () {
      const { feeCollector, ethers, other } = await deployFixture();
      await expect(
        feeCollector.connect(other).setFee(INITIAL_FEE * 2n)
      ).to.be.revert(ethers);
    });

    it("rechaza un fee que supera MAX_FEE", async function () {
      const { feeCollector, owner } = await deployFixture();
      await expect(
        feeCollector.connect(owner).setFee(MAX_FEE + 1n)
      ).to.be.revertedWith("Fee excede el maximo permitido");
    });
  });

  describe("setTreasury", function () {
    it("permite al owner actualizar treasury", async function () {
      const { feeCollector, owner, other } = await deployFixture();
      await feeCollector.connect(owner).setTreasury(other.address);
      expect(await feeCollector.treasury()).to.equal(other.address);
    });

    it("rechaza que alguien que no es el owner actualice treasury", async function () {
      const { feeCollector, ethers, other } = await deployFixture();
      await expect(
        feeCollector.connect(other).setTreasury(other.address)
      ).to.be.revert(ethers);
    });

    it("rechaza address(0) como nueva treasury", async function () {
      const { feeCollector, owner } = await deployFixture();
      await expect(
        feeCollector
          .connect(owner)
          .setTreasury("0x0000000000000000000000000000000000000000")
      ).to.be.revertedWith("Treasury invalida");
    });
  });

  describe("pause/unpause", function () {
    it("permite al owner pausar y reanudar", async function () {
      const { feeCollector, ethers, owner, other } = await deployFixture();
      await feeCollector.connect(owner).pause();
      await feeCollector.connect(owner).unpause();
      await expect(
        feeCollector.connect(other).collectFee({ value: INITIAL_FEE })
      ).to.not.be.revert(ethers);
    });

    it("rechaza que alguien que no es el owner pause", async function () {
      const { feeCollector, ethers, other } = await deployFixture();
      await expect(feeCollector.connect(other).pause()).to.be.revert(ethers);
    });
  });
});
