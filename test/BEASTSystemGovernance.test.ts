import { expect } from "chai";
import { ethers } from "hardhat";
import { LUCRToken, LucricityGovernor, BEASTSystemBus } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BEAST System 3.0 Governance & System Bus Suite", function () {
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;

  let lucrToken: LUCRToken;
  let governor: LucricityGovernor;
  let systemBus: BEASTSystemBus;

  const INITIAL_MINT = ethers.parseEther("100000000"); // 100M LUCR

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    // 1. Deploy System Bus
    const SystemBusFactory = await ethers.getContractFactory("BEASTSystemBus");
    systemBus = await SystemBusFactory.deploy();
    await systemBus.waitForDeployment();

    // 2. Deploy LUCR Token
    const LUCRFactory = await ethers.getContractFactory("LUCRToken");
    lucrToken = await LUCRFactory.deploy(owner.address);
    await lucrToken.waitForDeployment();

    // 3. Deploy Lucricity Governor
    const GovernorFactory = await ethers.getContractFactory("LucricityGovernor");
    governor = await GovernorFactory.deploy(await lucrToken.getAddress());
    await governor.waitForDeployment();

    // 4. Authorize Governor on System Bus
    await systemBus.setAuthorizedEmitter(await governor.getAddress(), true);
  });

  describe("LUCRToken Operations", function () {
    it("should initialize initial supply to owner", async function () {
      expect(await lucrToken.balanceOf(owner.address)).to.equal(INITIAL_MINT);
    });

    it("should permit self-delegation for voting checkpoints", async function () {
      await lucrToken.delegate(owner.address);
      const votes = await lucrToken.getVotes(owner.address);
      expect(votes).to.equal(INITIAL_MINT);
    });

    it("should allow owner to mint within cap limits", async function () {
      const mintAmount = ethers.parseEther("1000");
      await lucrToken.mint(voter1.address, mintAmount, "Community Grant");
      expect(await lucrToken.balanceOf(voter1.address)).to.equal(mintAmount);
    });
  });

  describe("BEASTSystemBus Event Handling", function () {
    it("should dispatch and emit SystemEventEmitted logs", async function () {
      const payload = ethers.toUtf8Bytes("DEPLOYMENT_VERIFIED");
      
      await expect(
        systemBus.emitSystemEvent("TEST_MODULE", "HEALTH_CHECK", payload)
      )
        .to.emit(systemBus, "SystemEventEmitted")
        .withArgs(
          ethers.Uint8Array.from, // Matches calculated eventId
          "TEST_MODULE",
          "HEALTH_CHECK",
          ethers.hexlify(payload),
          ethers.Uint8Array.from, // Matches block timestamp
          owner.address
        );
    });

    it("should revert unauthorized event emission attempts", async function () {
      const payload = ethers.toUtf8Bytes("UNAUTHORIZED_ATTEMPT");
      await expect(
        systemBus.connect(voter1).emitSystemEvent("MALICIOUS", "TRIGGER", payload)
      ).to.be.revertedWith("BEASTSystemBus: Unauthorized emitter");
    });
  });

  describe("LucricityGovernor Proposal Lifecycle", function () {
    it("should create, advance, and verify proposal voting state", async function () {
      // Delegate voting power
      await lucrToken.delegate(owner.address);

      const targetAddress = await systemBus.getAddress();
      const callData = systemBus.interface.encodeFunctionData("setAuthorizedEmitter", [voter1.address, true]);
      const description = "Proposal #1: Authorize Voter1 on System Bus";

      // 1. Propose
      const proposeTx = await governor.propose(
        [targetAddress],
        [0],
        [callData],
        description
      );
      const proposeReceipt = await proposeTx.wait();
      
      const proposalId = await governor.hashProposal(
        [targetAddress],
        [0],
        [callData],
        ethers.id(description)
      );

      // Proposal State: 0 = Pending
      expect(await governor.state(proposalId)).to.equal(0);

      // Mine blocks to advance past voting delay (1 block)
      await ethers.provider.send("evm_mine", []);

      // Proposal State: 1 = Active
      expect(await governor.state(proposalId)).to.equal(1);

      // 2. Cast Vote (1 = For)
      await governor.castVote(proposalId, 1);

      const proposalVotes = await governor.proposalVotes(proposalId);
      expect(proposalVotes.forVotes).to.equal(INITIAL_MINT);
    });
  });
});
