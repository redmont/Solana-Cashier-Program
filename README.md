<h1>Cashier Program/Contract for Solana</h1>

Mainnet Deployment: 
[https://solscan.io/account/8sN18zRK9LvJbRWFLfpgY1FmAUGzZwEUapH2JxuUiA6H](https://solscan.io/account/8sN18zRK9LvJbRWFLfpgY1FmAUGzZwEUapH2JxuUiA6H)

I wrote this anchor contract for RWG's Cashier section of the Brawlers Game with the following features - 

<h3>Key Features</h3>

- Allow or disallow an SPL-token

- Add or remove SPL-token support

- Deposit and swap any tradable SPL token to USDC using Jupiter Exchange Swap

<b>Note:</b> 

Although I'm not proficient in Rust and Solana at the time of writing this, I managed to write this program in Rust, unit-tested it in the Anchor framework, and deployed it on devnet and mainnet.

<h2>Running Locally & Testing</h2>

```
anchor build
anchor deploy
anchor test
```
