/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const cashierWithdraw = buildModule("CashierWithdraw", (m) => {
  const deployer = m.getAccount(0);
  const admin = m.getParameter("admin", deployer);
  const signer = m.getParameter("signer");
  const treasury = m.getParameter("treasury", deployer);
  const payoutToken = m.getParameter("payoutToken");
  const cashierWithdraw = m.contract("CashierWithdraw", [admin, signer, treasury, payoutToken]);

  return {
    cashierWithdraw,
  };
});

export default cashierWithdraw;
