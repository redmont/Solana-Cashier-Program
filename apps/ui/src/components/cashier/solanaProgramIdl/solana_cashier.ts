export type SolanaCashier = {
  version: '0.1.0';
  name: 'solana_cashier';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        {
          name: 'state';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'treasury';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'transferOwnership';
      accounts: [
        {
          name: 'state';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'currentOwner';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'newOwner';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'setTreasury';
      accounts: [
        {
          name: 'state';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'newTreasury';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'addToken';
      accounts: [
        {
          name: 'state';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'token';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'removeToken';
      accounts: [
        {
          name: 'state';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'token';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'setOutToken';
      accounts: [
        {
          name: 'state';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'token';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'depositAndSwap';
      accounts: [
        {
          name: 'state';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'treasury';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'state';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'treasury';
            type: 'publicKey';
          },
          {
            name: 'inTokens';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'outToken';
            type: 'publicKey';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'DepositEvent';
      fields: [
        {
          name: 'user';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'token';
          type: 'publicKey';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'Unauthorized';
      msg: 'You are not authorized to perform this action.';
    },
    {
      code: 6001;
      name: 'TokenNotAllowed';
      msg: 'This token is not allowed.';
    },
  ];
};

export const IDL: SolanaCashier = {
  version: '0.1.0',
  name: 'solana_cashier',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'treasury',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'transferOwnership',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'currentOwner',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'newOwner',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'setTreasury',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'newTreasury',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'addToken',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'token',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'removeToken',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'token',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'setOutToken',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'token',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'depositAndSwap',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'treasury',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'state',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'treasury',
            type: 'publicKey',
          },
          {
            name: 'inTokens',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'outToken',
            type: 'publicKey',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'DepositEvent',
      fields: [
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'token',
          type: 'publicKey',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'Unauthorized',
      msg: 'You are not authorized to perform this action.',
    },
    {
      code: 6001,
      name: 'TokenNotAllowed',
      msg: 'This token is not allowed.',
    },
  ],
};
