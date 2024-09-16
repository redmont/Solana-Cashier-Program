export const native = [
  {
    networkId: 11155111,
    url: 'https://sepolia-faucet.pk910.de/',
  },
  {
    networkId: 80002,
    url: 'https://faucet.polygon.technology/',
  },
  {
    networkId: 'devnet',
    url: 'https://faucet.solana.com/',
  },
] as const;

export const token = [
  {
    networkId: 80002,
    contract: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
    url: 'https://faucet.circle.com/',
  },
  {
    networkId: 11155111,
    contract: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    url: 'https://faucet.circle.com/',
  },
  {
    networkId: 'devnet',
    contract: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    url: 'https://faucet.circle.com/',
  },
] as const;
