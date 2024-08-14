import { viem } from "hardhat";
import { parseEther } from "viem";

export async function deployCashierDepositFixture() {
  const [owner, treasury] = await viem.getWalletClients();

  const cashierDeposit = await viem.deployContract("CashierDeposit", [owner.account.address, treasury.account.address]);
  const testToken = await viem.deployContract("TestToken", [owner.account.address]);

  const mintTx = await testToken.write.mint([owner.account.address, parseEther("1000000")]);
  const publicClient = await viem.getPublicClient();

  await publicClient.waitForTransactionReceipt({ hash: mintTx });

  const allowHash = await cashierDeposit.write.allowToken([testToken.address, 6]);

  await publicClient.waitForTransactionReceipt({ hash: allowHash });

  return { publicClient, cashierDeposit, testToken, owner, treasury };
}
