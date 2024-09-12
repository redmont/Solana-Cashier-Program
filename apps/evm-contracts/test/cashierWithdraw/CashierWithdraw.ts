import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { encodePacked, keccak256, parseEther } from "viem";

import { deployCashierWithdrawFixture } from "./CashierWithdraw.fixture";

use(chaiAsPromised);

describe("CashierWithdraw", function () {
  describe("Withdrawals", function () {
    it("should allow admin to pause contract", async function () {
      const { publicClient, cashierWithdraw } = await loadFixture(deployCashierWithdrawFixture);

      const withdrawalTx = await cashierWithdraw.write.pause();

      const receipt = await publicClient.waitForTransactionReceipt({ hash: withdrawalTx });

      expect(receipt.status).to.equal("success");

      const paused = await cashierWithdraw.read.paused();

      expect(paused).to.equal(true);
    });

    it("should not allow non-admin to pause contract", async function () {
      const { cashierWithdraw, user } = await loadFixture(deployCashierWithdrawFixture);

      // Contract should not be paused
      const paused = await cashierWithdraw.read.paused();
      expect(paused).to.equal(false);

      await expect(
        cashierWithdraw.write.pause({
          account: user.account,
        }),
      ).to.eventually.be.rejected;

      // Contract should still not be paused
      const paused2 = await cashierWithdraw.read.paused();
      expect(paused2).to.equal(false);
    });

    it("should pay out receipt", async function () {
      const { publicClient, cashierWithdraw, testToken, signer, user } =
        await loadFixture(deployCashierWithdrawFixture);

      const receiptId = "0x00001111222233334444555566667777";

      const validFrom = BigInt(await time.latest());
      const validTo = validFrom + BigInt(100);

      const message = keccak256(
        encodePacked(
          ["bytes16", "address", "uint256", "uint256", "uint256"],
          [receiptId, user.account.address, parseEther("1"), validFrom, validTo],
        ),
      );
      const signature = await signer.signMessage({
        message: { raw: message },
      });

      const previousBalance = await testToken.read.balanceOf([user.account.address]);

      const payoutTx = await cashierWithdraw.write.withdrawWithReceipt(
        [receiptId, parseEther("1"), validFrom, validTo, signature],
        {
          account: user.account,
        },
      );

      await publicClient.waitForTransactionReceipt({ hash: payoutTx });

      const newBalance = await testToken.read.balanceOf([user.account.address]);

      expect(newBalance).to.equal(previousBalance + parseEther("1"));
    });

    it("should not allow receipt payouts before the validFrom date", async function () {
      const { cashierWithdraw, testToken, signer, user } = await loadFixture(deployCashierWithdrawFixture);

      const receiptId = "0x00001111222233334444555566667777";

      const validFrom = BigInt((await time.latest()) + 100);
      const validTo = validFrom + BigInt(100);

      const message = keccak256(
        encodePacked(
          ["bytes16", "address", "uint256", "uint256", "uint256"],
          [receiptId, user.account.address, parseEther("1"), validFrom, validTo],
        ),
      );
      const signature = await signer.signMessage({
        message: { raw: message },
      });

      const previousBalance = await testToken.read.balanceOf([user.account.address]);

      await expect(
        cashierWithdraw.write.withdrawWithReceipt([receiptId, parseEther("1"), validFrom, validTo, signature], {
          account: user.account,
        }),
      ).to.eventually.be.rejectedWith("WithdrawalTooEarly");

      const newBalance = await testToken.read.balanceOf([user.account.address]);

      expect(newBalance).to.equal(previousBalance);
    });

    it("should not allow receipt payouts after the validTo date", async function () {
      const { cashierWithdraw, testToken, signer, user } = await loadFixture(deployCashierWithdrawFixture);

      const receiptId = "0x00001111222233334444555566667777";

      const validFrom = BigInt((await time.latest()) - 100);
      const validTo = validFrom - BigInt(50);

      const message = keccak256(
        encodePacked(
          ["bytes16", "address", "uint256", "uint256", "uint256"],
          [receiptId, user.account.address, parseEther("1"), validFrom, validTo],
        ),
      );
      const signature = await signer.signMessage({
        message: { raw: message },
      });

      const previousBalance = await testToken.read.balanceOf([user.account.address]);

      await expect(
        cashierWithdraw.write.withdrawWithReceipt([receiptId, parseEther("1"), validFrom, validTo, signature], {
          account: user.account,
        }),
      ).to.eventually.be.rejectedWith("WithdrawalTooLate");

      const newBalance = await testToken.read.balanceOf([user.account.address]);

      expect(newBalance).to.equal(previousBalance);
    });

    it("should not allow receipt payouts if the contract is paused", async function () {
      const { cashierWithdraw, testToken, signer, user } = await loadFixture(deployCashierWithdrawFixture);

      const receiptId = "0x00001111222233334444555566667777";

      const validFrom = BigInt(await time.latest());
      const validTo = validFrom + BigInt(100);

      const message = keccak256(
        encodePacked(
          ["bytes16", "address", "uint256", "uint256", "uint256"],
          [receiptId, user.account.address, parseEther("1"), validFrom, validTo],
        ),
      );
      const signature = await signer.signMessage({
        message: { raw: message },
      });

      const previousBalance = await testToken.read.balanceOf([user.account.address]);

      await cashierWithdraw.write.pause();

      await expect(
        cashierWithdraw.write.withdrawWithReceipt([receiptId, parseEther("1"), validFrom, validTo, signature], {
          account: user.account,
        }),
      ).to.eventually.be.rejected;

      const newBalance = await testToken.read.balanceOf([user.account.address]);

      expect(newBalance).to.equal(previousBalance);
    });

    it("should allow bulk payouts", async function () {
      const { cashierWithdraw, testToken, signer, user } = await loadFixture(deployCashierWithdrawFixture);

      // Create 5 receipts
      const receiptIds: `0x${string}`[] = [];
      for (let i = 1; i <= 5; i++) {
        const receiptId: `0x${string}` = `0x${i.toString(16).padStart(32, "0")}`;
        receiptIds.push(receiptId);
      }

      const amounts = Array(receiptIds.length).fill(parseEther("1"));
      const validFrom = BigInt((await time.latest()) - 100);
      const validFroms = Array(receiptIds.length).fill(validFrom);
      const validTo = validFrom + BigInt(1000);
      const validTos = Array(receiptIds.length).fill(validTo);

      const messages: `0x${string}`[] = [];
      for (const receiptId of receiptIds) {
        const message = keccak256(
          encodePacked(
            ["bytes16", "address", "uint256", "uint256", "uint256"],
            [receiptId, user.account.address, parseEther("1"), validFrom, validTo],
          ),
        );
        messages.push(message);
      }

      const signatures: `0x${string}`[] = [];
      for (const message of messages) {
        const signature = await signer.signMessage({
          message: { raw: message },
        });
        signatures.push(signature);
      }

      const previousBalance = await testToken.read.balanceOf([user.account.address]);

      await cashierWithdraw.write.batchWithdrawWithReceipts([receiptIds, amounts, validFroms, validTos, signatures], {
        account: user.account,
      });

      const newBalance = await testToken.read.balanceOf([user.account.address]);

      expect(newBalance).to.equal(previousBalance + parseEther("5"));
    });
  });
});
