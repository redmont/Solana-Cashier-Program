# Brawl3rs EVM Contracts

Brawlers EVM Contracts is a project focused on developing and deploying smart contracts to various Ethereum Virtual
Machine (EVM) compatible blockchain networks for the exciting Brawl3rs game. It uses Hardhat for its development
environment and configuration, and `pnpm` as the package manager and task runner to facilitate the deployment process.

## Deploy to a chain

Add the chain to the `apps/evm-contracts/hardhat.config.ts` file.

```typescript
// apps/evm-contracts/hardhat.config.ts

module.exports = {
  networks: {
    // Add your network configurations here and url if needed
    <network>: getChainConfig('<network>', 'alternateUrl?'),
  },
};
```

Add a parameters json file to the `apps/evm-contracts/ignition/parameters` folder. The file should be named after the
network you want to deploy to. For example, to deploy to the Sepolia testnet, create a `sepolia.json` file in the
`apps/evm-contracts/ignition/parameters` folder.

Then run the following command:

```shell
pnpm run deploy <network>
```

Replace `<network>` with the name of the network you want to deploy to.
