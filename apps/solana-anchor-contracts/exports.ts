import idl from './cashier-idl';

export default {
  CashierDeposit: {
    mainnet: {
      idl,
      address: '9RKGsYb1CyJMs4ehGaGDf55E8YFgAzVwUCYtMwJBV6AM',
      programState: 'kZJhBupZ93eTCFvVKu57KSrVGBYh99SSGVwy4ucGWwW',
      parameters: {
        allowedTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
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
