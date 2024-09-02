const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function main() {
  console.log("Starting verification process...");

  const deploymentsPath = path.join(__dirname, "ignition", "deployments");

  // TODO fix amoy verification

  // Read all folders in the deployments directory
  const folders = fs
    .readdirSync(deploymentsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const folderName of folders) {
    try {
      console.log(`Verifying ${folderName}...`);
      execSync(`npx hardhat ignition verify ${folderName}`, { stdio: "pipe" });
    } catch (error) {
      console.error(`Failed to verify contracts for ${folderName}: ${error.message}`);
    }
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
