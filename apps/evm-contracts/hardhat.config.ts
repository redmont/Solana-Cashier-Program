import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ignition-viem";
import "@nomicfoundation/hardhat-toolbox-viem";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";
import * as chains from "viem/chains";

const mnemonic: string = vars.get("MNEMONIC", "test test test test test test test test test test test junk");
const alchemyApiKey: string = vars.get("ALCHEMY_API_KEY", "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF");
const etherscanApiKey: string = vars.get("ETHERSCAN_API_KEY", "");

const getUrl = (chain: keyof typeof chains): string => chains[chain].rpcUrls.default.http[0];

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
  etherscan: {
    apiKey: etherscanApiKey,
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chains.hardhat.id,
    },
    sepolia: getChainConfig("sepolia", `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    mainnet: getChainConfig("mainnet", `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    polygonAmoy: getChainConfig("polygonAmoy"),
    polygon: getChainConfig("polygon", `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
  },
};

export default config;
