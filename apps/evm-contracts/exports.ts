import mainnetCashierWithdraw from "./ignition/deployments/chain-1/artifacts/CashierWithdraw#CashierWithdraw.json";
import mainnetDeployments from "./ignition/deployments/chain-1/deployed_addresses.json";
import mainnetParameters from "./ignition/parameters/mainnet.json";
import sepoliaCashierDeposit from "./ignition/deployments/chain-11155111/artifacts/CashierDeposit#CashierDeposit.json";
import sepoliaCashierWithdraw from "./ignition/deployments/chain-11155111/artifacts/CashierWithdraw#CashierWithdraw.json";
import sepoliaDeployments from "./ignition/deployments/chain-11155111/deployed_addresses.json";
import sepoliaParameters from "./ignition/parameters/sepolia.json";
import polygonCashierDeposit from "./ignition/deployments/chain-137/artifacts/CashierDeposit#CashierDeposit.json";
import polygonCashierWithdraw from "./ignition/deployments/chain-137/artifacts/CashierWithdraw#CashierWithdraw.json";
import polygonDeployments from "./ignition/deployments/chain-137/deployed_addresses.json";
import polygonParameters from "./ignition/parameters/polygon.json";
import polygonAmoyCashierDeposit from "./ignition/deployments/chain-80002/artifacts/CashierDeposit#CashierDeposit.json";
import polygonAmoyCashierWithdraw from "./ignition/deployments/chain-80002/artifacts/CashierWithdraw#CashierWithdraw.json";
import polygonAmoyDeployments from "./ignition/deployments/chain-80002/deployed_addresses.json";
import polygonAmoyParameters from "./ignition/parameters/polygonAmoy.json";

export default {
  CashierWithdraw: {
    1: {
      abi: mainnetCashierWithdraw.abi,
      address: mainnetDeployments["CashierWithdraw#CashierWithdraw"] as `0x${string}`,
      parameters: mainnetParameters["CashierWithdraw"],
    },
    11155111: {
      abi: sepoliaCashierWithdraw.abi,
      address: sepoliaDeployments["CashierWithdraw#CashierWithdraw"] as `0x${string}`,
      parameters: sepoliaParameters["CashierWithdraw"],
    },
    137: {
      abi: polygonCashierWithdraw.abi,
      address: polygonDeployments["CashierWithdraw#CashierWithdraw"] as `0x${string}`,
      parameters: polygonParameters["CashierWithdraw"],
    },
    80002: {
      abi: polygonAmoyCashierWithdraw.abi,
      address: polygonAmoyDeployments["CashierWithdraw#CashierWithdraw"] as `0x${string}`,
      parameters: polygonAmoyParameters["CashierWithdraw"],
    },
  },
  CashierDeposit: {
    1: {
      abi: sepoliaCashierDeposit.abi,
      address: "0x52FbEd51F99549F3C55CD2611C30A7Df29d259cd" as `0x${string}`,
      parameters: { allowedTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    },
    11155111: {
      abi: sepoliaCashierDeposit.abi,
      address: sepoliaDeployments["CashierDeposit#CashierDeposit"] as `0x${string}`,
      parameters: sepoliaParameters["CashierDeposit"],
    },
    137: {
      abi: polygonCashierDeposit.abi,
      address: polygonDeployments["CashierDeposit#CashierDeposit"] as `0x${string}`,
      parameters: polygonParameters["CashierDeposit"],
    },
    80002: {
      abi: polygonAmoyCashierDeposit.abi,
      address: polygonAmoyDeployments["CashierDeposit#CashierDeposit"] as `0x${string}`,
      parameters: polygonAmoyParameters["CashierDeposit"],
    },
  },
} as const;
