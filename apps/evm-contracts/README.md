# Brawl3rs EVM Contracts

Brawlers EVM Contracts is a project focused on developing and deploying smart contracts to various Ethereum Virtual
Machine (EVM) compatible blockchain networks for the exciting Brawl3rs game. It uses Hardhat for its development
environment and configuration, and `pnpm` as the package manager and task runner to facilitate the deployment process.

## Deploy to a chain

Create an ignition module for the contract you want to deploy. You can use the
[CashierDeposit](https://github.com/bltzr-gg/brawlers-evm-contracts/blob/main/ignition/modules/CashierDeposit.ts) as an
example.

Then, if deploying to a new chain, add the chain to the `apps/evm-contracts/hardhat.config.ts` file.

```typescript
// apps/evm-contracts/hardhat.config.ts

module.exports = {
  networks: {
    // Add your network configurations here and url if needed
    <network>: getChainConfig('<network>', 'alternateUrl?'),
  },
};
```

You can choose to add a parameters json file to the `apps/evm-contracts/ignition/parameters` using all available
parameters for the module in `ignition/modules` folder or the command will prompt you the required variables to enter.

Command to deploy:

```console
hardhat ignition deploy ignition/modules/(contract name).ts --network (network) --parameters
```

./ignition/parameters/(network).json Then, enable the chain for Dynamic auth provider. Be mindful of the environment you
want to enable it for: https://app.dynamic.xyz/dashboard/chains-and-networks#evm.

Finally, add the chain to `apps/ui/src/config/chains.ts` and `apps/ui/src/config/wagmi.ts` to the environment you want.
