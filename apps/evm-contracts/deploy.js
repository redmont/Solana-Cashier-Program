const { execSync } = require("child_process");
const fs = require("fs");

const network = process.argv[2];

if (!network) {
  console.error("Network name is required. Usage: pnpm run deploy <network>");
  process.exit(1);
}

const parametersExist = fs.existsSync(`./ignition/parameters/${network}.json`);
if (!parametersExist) {
  console.warn(`Parameters file for network ${network} does not exist.`);
}

const command = `hardhat ignition deploy ignition/modules/CashierDeposit.ts --network ${network} --parameters ignition/parameters/${network}.json`;

try {
  execSync(command, { stdio: "inherit" });
} catch (error) {
  console.error(`Failed to deploy to network ${network}`);
  process.exit(1);
}
