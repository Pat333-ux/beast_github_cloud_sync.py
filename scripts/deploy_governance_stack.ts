import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("==================================================");
  console.log("🚀 Deploying BEAST System 3.0 Web3 Governance Stack");
  console.log(`Network: ${network.name}`);
  console.log("==================================================");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Account: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ETH`);

  // 1. Deploy BEASTSystemBus
  console.log("\n📦 1/3 Deploying BEASTSystemBus.sol...");
  const SystemBusFactory = await ethers.getContractFactory("BEASTSystemBus");
  const systemBus = await SystemBusFactory.deploy();
  await systemBus.waitForDeployment();
  const systemBusAddress = await systemBus.getAddress();
  console.log(`✅ BEASTSystemBus deployed to: ${systemBusAddress}`);

  // 2. Deploy LUCR Token (ERC-20, ERC-20Permit, ERC-20Votes)
  console.log("\n📦 2/3 Deploying LUCRToken.sol...");
  const LUCRTokenFactory = await ethers.getContractFactory("LUCRToken");
  const lucrToken = await LUCRTokenFactory.deploy(deployer.address);
  await lucrToken.waitForDeployment();
  const lucrTokenAddress = await lucrToken.getAddress();
  console.log(`✅ LUCRToken deployed to: ${lucrTokenAddress}`);

  // 3. Deploy LucricityGovernor
  console.log("\n📦 3/3 Deploying LucricityGovernor.sol...");
  const GovernorFactory = await ethers.getContractFactory("LucricityGovernor");
  const governor = await GovernorFactory.deploy(lucrTokenAddress);
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log(`✅ LucricityGovernor deployed to: ${governorAddress}`);

  // 4. Configure Governance Permissions & Authorize System Bus
  console.log("\n⚙️ Configuring System Bus Emitters & Authorization...");
  const setEmitterTx = await systemBus.setAuthorizedEmitter(governorAddress, true);
  await setEmitterTx.wait();
  console.log(`✅ Authorized LucricityGovernor as System Bus emitter.`);

  // 5. Emit Initial Deployment Event
  const eventPayload = ethers.toUtf8Bytes(
    JSON.stringify({
      status: "DEPLOYED",
      system: "BEAST System 3.0",
      cloud_run_backend: "https://beastsystem-70875693050.us-central1.run.app",
      governor: governorAddress,
      lucr_token: lucrTokenAddress
    })
  );

  const emitTx = await systemBus.emitSystemEvent("SYSTEM_INIT", "STACK_DEPLOYED", eventPayload);
  await emitTx.wait();
  console.log("⚡ Bootstrapped stack deployment log on BEASTSystemBus.");

  console.log("\n==================================================");
  console.log("🎉 Governance Stack Deployment Complete!");
  console.log(`BEAST_SYSTEM_BUS_ADDRESS=${systemBusAddress}`);
  console.log(`LUCR_TOKEN_ADDRESS=${lucrTokenAddress}`);
  console.log(`GOVERNOR_ADDRESS=${governorAddress}`);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
