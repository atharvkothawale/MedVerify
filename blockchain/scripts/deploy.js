import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const networkName = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log(`====================================================`);
  console.log(` Deploying MedicalRecordVerification Contract`);
  console.log(` Target Network: ${networkName} (Chain ID: ${chainId})`);
  console.log(`====================================================`);

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(`No signer available for network ${networkName}. Ensure PRIVATE_KEY is configured in .env for live networks.`);
  }

  console.log(`\nDeployer Address:\n${deployer.address}`);

  const MedicalRecordVerification = await hre.ethers.getContractFactory("MedicalRecordVerification");
  const contract = await MedicalRecordVerification.deploy();

  console.log("\nWaiting for deployment transaction confirmation...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();

  console.log(`\n====================================================`);
  console.log(` Contract Deployed Successfully!`);
  console.log(`====================================================`);
  console.log(`Network:                ${networkName}`);
  console.log(`Chain ID:               ${chainId.toString()}`);
  console.log(`Deployer:               ${deployer.address}`);
  console.log(`Contract Address:       ${contractAddress}`);
  console.log(`Transaction Hash:       ${deploymentTx?.hash || 'N/A'}`);
  console.log(`====================================================\n`);

  // Save non-secret deployment record to blockchain/deployments/<network>.json
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    network: networkName,
    chainId: Number(chainId),
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTransaction: deploymentTx?.hash || "",
    timestamp: new Date().toISOString(),
  };

  const fileName = networkName === "localhost" || networkName === "hardhat" ? "localhost.json" : `${networkName}.json`;
  const filePath = path.join(deploymentsDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(deploymentData, null, 2));
  console.log(`Saved deployment info to: ${filePath}\n`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
