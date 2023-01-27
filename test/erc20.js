const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployContractsFixture() {
    const preMintToken = 10000;

    const Erc20 = await ethers.getContractFactory("MyToken");
    const erc20 = await Erc20.deploy(preMintToken);

    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2] = await ethers.getSigners();

    return { erc20, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the total supply to the address of contract owner", async function () {
      const { erc20, owner } = await loadFixture(deployContractsFixture);
      expect(await erc20.balanceOf(owner.address)).to.equal(
        await erc20.totalSupply()
      );
    });
    describe("Transactions", function () {
      it("Should transfers the tokens between accounts", async function () {
        const { erc20, owner, addr1, addr2 } = await loadFixture(
          deployContractsFixture
        );
        await erc20.transfer(addr1.address, ethers.utils.parseEther("500"));
        expect(await erc20.balanceOf(addr1.address)).to.equal(
          ethers.utils.parseEther("500")
        );
        // transfer 500 token form owner account to addr1
        expect(
          await erc20.transfer(addr1.address, ethers.utils.parseEther("500"))
        ).changeTokenBalances(
          erc20,
          [owner, addr1],
          [-ethers.utils.parseEther("500"), ethers.utils.parseEther("500")]
        );
        // transfer 500 tokens from addr1 to addr2
        // using .connect to connect the account addr1
        expect(
          await erc20
            .connect(addr1)
            .transfer(addr2.address, ethers.utils.parseEther("500"))
        ).changeTokenBalances(
          erc20,
          [addr1, addr2],
          [-ethers.utils.parseEther("500"), ethers.utils.parseEther("500")]
        );
      });

      it("should emit the Transfer events", async function () {
        const { erc20, owner, addr1, addr2 } = await loadFixture(
          deployContractsFixture
        );

        // Transfer 50 tokens from owner to addr1
        await expect(erc20.transfer(addr1.address, 50))
          .to.emit(erc20, "Transfer")
          .withArgs(owner.address, addr1.address, 50);

        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await expect(erc20.connect(addr1).transfer(addr2.address, 50))
          .to.emit(erc20, "Transfer")
          .withArgs(addr1.address, addr2.address, 50);
      });

      it("Should fail if sender doesn't have enough tokens", async function () {
        const { erc20, owner, addr1 } = await loadFixture(
          deployContractsFixture
        );
        const initialOwnerBalance = await erc20.balanceOf(owner.address);

        // Try to send 1 token from addr1 (0 tokens) to owner.
        // `require` will evaluate false and revert the transaction.
        await expect(
          erc20.connect(addr1).transfer(owner.address, 1)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

        // Owner balance shouldn't have changed.
        expect(await erc20.balanceOf(owner.address)).to.equal(
          initialOwnerBalance
        );
      });
    });
  });
});
