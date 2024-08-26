import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ignition-viem";
import "@nomicfoundation/hardhat-toolbox-viem";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";
import * as chains from "viem/chains";

const mnemonic: string = vars.get("MNEMONIC", "test test test test test test test test test test test junk");

const alchemyApiKey: string = vars.get("ALCHEMY_API_KEY", "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF");

const getUrl = (chain: keyof typeof chains): string => {
  switch (chain) {
    case "avalanche":
      return "https://api.avax.network/ext/bc/C/rpc";
    case "bsc":
      return "https://bsc-dataseed1.binance.org";
    case "sepolia":
      return `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;

    default:
      return `https://${chain}.g.alchemy.com/v2/${alchemyApiKey}`;
  }
};

const getChainConfig = (chain: keyof typeof chains, url = getUrl(chain)): NetworkUserConfig => ({
  accounts: {
    count: 10,
    mnemonic,
    path: "m/44'/60'/0'/0",
  },
  chainId: chains[chain].id,
  url,
});

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chains.hardhat.id,
    },
    sepolia: getChainConfig("sepolia"),
    mainnet: getChainConfig("mainnet"),
  },
};

export default config;
