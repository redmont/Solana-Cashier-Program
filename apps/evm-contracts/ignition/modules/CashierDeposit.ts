import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const cashierDeposit = buildModule("CashierDeposit", (m) => {
  const deployer = m.getAccount(0);
  const admin = m.getParameter("admin", deployer);
  const treasury = m.getParameter("treasury", deployer);
  const cashier = m.contract("CashierDeposit", [admin, treasury]);

  const allowedTokenAddress = m.getParameter("allowedTokenAddress");

  m.call(cashier, "allowToken", [allowedTokenAddress, 6]);

  return {
    cashier,
  };
});

export default cashierDeposit;
