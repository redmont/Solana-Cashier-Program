import { viem } from "hardhat";
import { parseEther } from "viem";

export async function deployCashierWithdrawFixture() {
  const [owner, treasury, signer, user] = await viem.getWalletClients();

  const testToken = await viem.deployContract("TestToken", [owner.account.address]);

  const cashierWithdraw = await viem.deployContract("CashierWithdraw", [
    owner.account.address,
    signer.account.address,
    treasury.account.address,
    testToken.address,
  ]);

  const mintTx = await testToken.write.mint([treasury.account.address, parseEther("1000000")]);
  const publicClient = await viem.getPublicClient();

  await publicClient.waitForTransactionReceipt({ hash: mintTx });

  const allowHash = await testToken.write.approve([cashierWithdraw.address, parseEther("1000000")], {
    account: treasury.account,
  });

  await publicClient.waitForTransactionReceipt({ hash: allowHash });

  return { publicClient, cashierWithdraw, testToken, owner, treasury, signer, user };
}
