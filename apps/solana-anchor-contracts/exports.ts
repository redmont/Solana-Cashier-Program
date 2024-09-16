import idl from './cashier-idl';

export default {
  CashierDeposit: {
    mainnet: {
      idl,
      // TODO fill this out when solana mainnet is deployed
      address: '',
      programState: '',
      parameters: {
        allowedTokenAddress: '',
      },
    },
    devnet: {
      idl,
      address: '8ebCPZKEwFhe6bhCE4nE2fuPUhZWhh6j6jJ5Ex3DmhJS',
      programState: 'CWxbux5txQ3juKdmvzrcQKQ9WHq1xAKQE8aDtkc3GnP',
      parameters: {
        allowedTokenAddress: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
      },
    },
  },
} as const;
