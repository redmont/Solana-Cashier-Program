import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { bytesToHex, padBytes, parseUnits, stringToBytes } from "viem";

import { deployCashierDepositFixture } from "./CashierDeposit.fixture";

describe("CashierDeposit", function () {
  describe("Deposits", function () {
    it("should allow deposits", async function () {
      const { publicClient, testToken, cashierDeposit, treasury } = await loadFixture(deployCashierDepositFixture);
      const amount = parseUnits("1", 6);

      const approveTx = await testToken.write.approve([cashierDeposit.address, amount]);
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      const depositTx = await cashierDeposit.write.deposit([
        bytesToHex(
          padBytes(stringToBytes("test user ID"), {
            size: 32,
          }),
        ) as `0x${string}`,
        testToken.address,
        amount,
      ]);
      await publicClient.waitForTransactionReceipt({ hash: depositTx });

      expect(await testToken.read.balanceOf([treasury.account.address])).to.equal(amount);
    });

    it("should not allow deposits less than 99c", async function () {
      const { publicClient, testToken, cashierDeposit } = await loadFixture(deployCashierDepositFixture);
      const amount = parseUnits("0.98", 6);

      const approveTx = await testToken.write.approve([cashierDeposit.address, amount]);
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      await expect(
        cashierDeposit.write.deposit([
          bytesToHex(
            padBytes(stringToBytes("test user ID"), {
              size: 32,
            }),
          ) as `0x${string}`,
          testToken.address,
          amount,
        ]),
      ).to.be.rejectedWith(`TooLowAmount`);
    });
  });
});
