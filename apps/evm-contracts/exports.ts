import { abi as mainnetCashierWithdrawAbi } from "./ignition/deployments/chain-1/artifacts/CashierWithdraw#CashierWithdraw.json";
import mainnetDeployments from "./ignition/deployments/chain-1/deployed_addresses.json";
import mainnetParameters from "./ignition/parameters/mainnet.json";
import { abi as sepoliaCashierDepositAbi } from "./ignition/deployments/chain-11155111/artifacts/CashierDeposit#CashierDeposit.json";
import { abi as sepoliaCashierWithdrawAbi } from "./ignition/deployments/chain-11155111/artifacts/CashierWithdraw#CashierWithdraw.json";
import sepoliaDeployments from "./ignition/deployments/chain-11155111/deployed_addresses.json";
import sepoliaParameters from "./ignition/parameters/sepolia.json";
import { abi as polygonCashierDepositAbi } from "./ignition/deployments/chain-137/artifacts/CashierDeposit#CashierDeposit.json";
import { abi as polygonCashierWithdrawAbi } from "./ignition/deployments/chain-137/artifacts/CashierWithdraw#CashierWithdraw.json";
import polygonDeployments from "./ignition/deployments/chain-137/deployed_addresses.json";
import polygonParameters from "./ignition/parameters/polygon.json";
import { abi as polygonAmoyCashierDepositAbi } from "./ignition/deployments/chain-80002/artifacts/CashierDeposit#CashierDeposit.json";
import { abi as polygonAmoyCashierWithdrawAbi } from "./ignition/deployments/chain-80002/artifacts/CashierWithdraw#CashierWithdraw.json";
import polygonAmoyDeployments from "./ignition/deployments/chain-80002/deployed_addresses.json";
import polygonAmoyParameters from "./ignition/parameters/polygonAmoy.json";

export default {
  CashierWithdraw: {
    1: {
      abi: mainnetCashierWithdrawAbi,
      address: mainnetDeployments["CashierWithdraw#CashierWithdraw"] as `0x${string}`,
      parameters: mainnetParameters["CashierWithdraw"],
    },
    11155111: {
      abi: sepoliaCashierWithdrawAbi,
      address: sepoliaDeployments["CashierWithdraw#CashierWithdraw"] as `0x${string}`,
      parameters: sepoliaParameters["CashierWithdraw"],
    },
    137: {
      abi: polygonCashierWithdrawAbi,
      address: polygonDeployments["CashierWithdraw#CashierWithdraw"] as `0x${string}`,
      parameters: polygonParameters["CashierWithdraw"],
    },
    80002: {
      abi: polygonAmoyCashierWithdrawAbi,
      address: polygonAmoyDeployments["CashierWithdraw#CashierWithdraw"] as `0x${string}`,
      parameters: polygonAmoyParameters["CashierWithdraw"],
    },
  },
  CashierDeposit: {
    1: {
      abi: sepoliaCashierDepositAbi,
      address: "0x52FbEd51F99549F3C55CD2611C30A7Df29d259cd" as `0x${string}`,
      parameters: { allowedTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    },
    11155111: {
      abi: sepoliaCashierDepositAbi,
      address: sepoliaDeployments["CashierDeposit#CashierDeposit"] as `0x${string}`,
      parameters: sepoliaParameters["CashierDeposit"],
    },
    137: {
      abi: polygonCashierDepositAbi,
      address: polygonDeployments["CashierDeposit#CashierDeposit"] as `0x${string}`,
      parameters: polygonParameters["CashierDeposit"],
    },
    80002: {
      abi: polygonAmoyCashierDepositAbi,
      address: polygonAmoyDeployments["CashierDeposit#CashierDeposit"] as `0x${string}`,
      parameters: polygonAmoyParameters["CashierDeposit"],
    },
  },
} as const;
