import { DeployFunction } from "hardhat-deploy/types";
import { vars } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const cashierDeposit = await hre.viem.deployContract("CashierDeposit", [deployer, deployer], {});
  const cashier = await hre.viem.getContractAt("CashierDeposit", cashierDeposit.address, {});
  console.log("CashierDeposit deployed at", cashierDeposit.address);
  const allowedTokenAddress = vars.get("USDC_CONTRACT_ADDRESS", "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238");
  const allowTokenTxId = await cashier.write.allowToken([allowedTokenAddress, 6]);
  const client = await hre.viem.getPublicClient();
  await client.waitForTransactionReceipt({ hash: allowTokenTxId });
  console.log(`Allowed ${allowedTokenAddress} to be deposited to the cashier.`);
};
export default func;
func.id = "deploy_cashier_deposit"; // id required to prevent reexecution
func.tags = ["CashierDeposit"];
