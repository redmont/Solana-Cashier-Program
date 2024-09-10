import * as anchor from '@project-serum/anchor';
import { Program, BorshCoder } from '@project-serum/anchor';
import { SolanaCashier, IDL } from '../target/types/solana_cashier';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  Connection,
} from '@solana/web3.js';
import { assert } from 'chai';
import {
  TOKEN_PROGRAM_ID,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

import base58 from 'bs58';

const heliusRpcUrl = process.env.HELIUS_RPC_URL;

const deployerPrivateKey = process.env.PAYER_PRIVATE_KEY;
const testUserPrivateKey = process.env.PAYER_PRIVATE_KEY;
const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY;

const deployerAccount = Keypair.fromSecretKey(
  base58.decode(deployerPrivateKey),
);

const signerAccount = Keypair.fromSecretKey(base58.decode(testUserPrivateKey));
const treasurySignerAccount = Keypair.fromSecretKey(
  base58.decode(treasuryPrivateKey),
);

const usdcTreasuryWalletAddress = process.env.USDC_TREASURY_WALLET_ADDRESS;
const usdcMintAddress = process.env.USDC_MINT_ADDRESS;

const programDeployedID = process.env.PROGRAM_DEPLOYED_ID;
const programStateAddress = process.env.PROGRAM_STATE_ADDRESS;

const treasuryAccount = new PublicKey(usdcTreasuryWalletAddress);
const mint = new PublicKey(usdcMintAddress);

describe('solana_cashier', () => {
  const connection = new Connection(heliusRpcUrl, 'confirmed');
  const wallet = anchor.Wallet.local();
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  anchor.setProvider(provider);

  console.log(
    'provider.wallet.publicKey:',
    provider.wallet.publicKey.toString(),
  );

  console.log('Deployer Account:', deployerAccount.publicKey.toString());

  const program = anchor.workspace.SolanaCashier as Program<SolanaCashier>;

  const newOwner = deployerAccount;

  const stateAccountFilePath = path.join(__dirname, 'stateAccount.json');
  const deployerAccountFilePath = path.join(__dirname, 'deployerAccount.json');
  const treasuryAccountFilePath = path.join(__dirname, 'deployerAccount.json');

  var stateAccount: PublicKey;

  it('decodes the transaction data based on idl', async () => {
    const idl = {
      instructions: [
        {
          name: 'depositAndSwap',
          args: [
            {
              name: 'amount',
              type: 'u64',
            },
            {
              name: 'userId',
              type: 'bytes',
            },
          ],
        },
      ],
    };
    const coder = new BorshCoder(idl);
    const ix = coder.instruction.decode(
      'Kj35qAFy2MvZT65ftmJH3ukUaJSTUtnx98g5Q',
      'base58',
    );
    console.log('Decoded instruction', ix.data?.userId?.toString());
  });

  it('Checks if the program is deployed', async () => {
    try {
      // Fetch the account information
      const programAccountInfo = await provider.connection.getAccountInfo(
        program.programId,
      );

      // Ensure the account exists
      assert.ok(programAccountInfo !== null, 'Program account does not exist');

      // Ensure the account is executable
      assert.ok(
        programAccountInfo.executable,
        'Program account is not marked as executable',
      );

      console.log('Program is deployed and executable.');
    } catch (err) {
      console.error('Failed to verify the program account:', err);
      assert.fail('The program is not deployed correctly.');
    }
  });

  it('Initializes the program', async () => {
    if (
      programDeployedID &&
      program.programId.toString() === programDeployedID &&
      programStateAddress
    ) {
      stateAccount = new PublicKey(programStateAddress);
      console.log('Program already deployed');
    } else {
      console.log('Deploying program: ', program.programId.toString());

      const stateAccountKeypair = Keypair.generate();
      stateAccount = stateAccountKeypair.publicKey;
      await program.methods
        .initialize(treasuryAccount)
        .accounts({
          state: stateAccount,
          owner: deployerAccount.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([deployerAccount, stateAccountKeypair])
        .rpc();

      saveKeypairToFile(stateAccountKeypair, stateAccountFilePath);
      saveKeypairToFile(deployerAccount, deployerAccountFilePath);
      saveKeypairToFile(treasurySignerAccount, treasuryAccountFilePath);
    }
    const state = await program.account.state.fetch(stateAccount);
    console.log('Program State:', state);

    const programAccounts = await connection.getProgramAccounts(
      new PublicKey(program.programId.toString()),
    );
    programAccounts.forEach(({ pubkey, account }) => {
      console.log(`Found account with pubkey: ${pubkey.toString()}`);
    });

    assert.ok(state.owner.equals(deployerAccount.publicKey));

    console.log('Program initialized successfully');
  });

  it('Transfers ownership', async () => {
    const state = await program.account.state.fetch(stateAccount);

    const oldOwner = state.owner;
    await program.methods
      .transferOwnership(newOwner.publicKey)
      .accounts({
        state: stateAccount,
        currentOwner: provider.wallet.publicKey,
      })
      .signers([])
      .rpc();

    assert.ok(state.owner.equals(newOwner.publicKey));
    console.log('Old owner:', oldOwner.toString());
    console.log('New owner:', newOwner.publicKey.toString());
    console.log('Ownership transferred successfully');
  });

  it('Sets a new treasury address', async () => {
    // const newTreasury = Keypair.generate();
    const newTreasury = treasuryAccount;

    // Derive the associated USDC token account address of treasury account
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      mint,
      newTreasury,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    console.log(
      'treasury USDC token account:',
      treasuryTokenAccount.toString(),
    );

    await program.methods
      .setTreasury(treasuryTokenAccount)
      .accounts({
        state: stateAccount,
        owner: newOwner.publicKey,
      })
      .signers([newOwner])
      .rpc();

    const state = await program.account.state.fetch(stateAccount);
    assert.ok(state.treasury.equals(treasuryTokenAccount));
    console.log('Treasury address set successfully');
  });

  it('Removes all tokens', async () => {
    // Fetch the current state to get all tokens
    let state = await program.account.state.fetch(stateAccount);

    // Iterate over each token and remove it
    for (const token of state.inTokens) {
      await program.methods
        .removeToken(token)
        .accounts({
          state: stateAccount,
          owner: newOwner.publicKey,
        })
        .signers([newOwner])
        .rpc();

      console.log(`Token ${token.toString()} removed successfully`);
    }

    // Verify that the inTokens array is now empty
    state = await program.account.state.fetch(stateAccount);
    assert.ok(state.inTokens.length === 0);
    console.log('All tokens removed successfully');
  });

  it('Allows and disallows tokens', async () => {
    const tokenMint = Keypair.generate().publicKey;

    // Allow the token
    await program.methods
      .addToken(tokenMint)
      .accounts({
        state: stateAccount,
        owner: newOwner.publicKey,
      })
      .signers([newOwner])
      .rpc();

    let state = await program.account.state.fetch(stateAccount);
    assert.ok(state.inTokens.some((token) => token.equals(tokenMint)));
    console.log('Token allowed successfully');

    // Disallow the token
    await program.methods
      .removeToken(tokenMint)
      .accounts({
        state: stateAccount,
        owner: newOwner.publicKey,
      })
      .signers([newOwner])
      .rpc();

    state = await program.account.state.fetch(stateAccount);
    assert.ok(!state.inTokens.some((token) => token.equals(tokenMint)));
    console.log('Token disallowed successfully');
  });

  it('Deposits a token and send it to treasury', async () => {
    // Derive the associated USDC token account address of user

    const userUsdcTokenAccount = await initializeTokenAccount(
      provider,
      mint,
      signerAccount,
    );

    console.log(
      'user USDC token account initialized successfully',
      userUsdcTokenAccount.toString(),
    );

    // Derive the associated USDC token account address of treasury account

    const treasuryUsdcTokenAccount = await initializeTokenAccount(
      provider,
      mint,
      treasurySignerAccount,
    );

    console.log(
      'treasury USDC token account initialized successfully',
      userUsdcTokenAccount.toString(),
    );

    // Add USDC token to allowed list
    await program.methods
      .addToken(mint)
      .accounts({
        state: stateAccount,
        owner: newOwner.publicKey,
      })
      .signers([newOwner])
      .rpc();

    console.log('USDC token added to allowed list successfully');

    const depositAmount = 500;

    // Get initial balances
    const initialUserBalance = (
      await getAccount(provider.connection, userUsdcTokenAccount)
    ).amount;
    console.log('initialUserBalance', initialUserBalance);

    const initialTreasuryBalance = (
      await getAccount(provider.connection, treasuryUsdcTokenAccount)
    ).amount;
    console.log('initialTreasuryBalance', initialTreasuryBalance);

    const userId = 'user123';

    // Convert user_id to bytes
    const bytesUserId = Buffer.from(userId, 'utf-8');

    await program.methods
      .depositAndSwap(new anchor.BN(depositAmount), bytesUserId)
      .accounts({
        state: stateAccount,
        treasury: treasuryUsdcTokenAccount,
        userTokenAccount: userUsdcTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        userAuthority: signerAccount.publicKey,
      })
      .signers([signerAccount])
      .rpc();

    // Get final balances
    const finalUserBalance = (
      await getAccount(provider.connection, userUsdcTokenAccount)
    ).amount;
    const finalTreasuryBalance = (
      await getAccount(provider.connection, treasuryUsdcTokenAccount)
    ).amount;

    console.log('finalUserBalance', finalUserBalance);
    console.log('finalTreasuryBalance', finalTreasuryBalance);

    //Verify balances
    assert.equal(
      finalUserBalance.toString(),
      (BigInt(initialUserBalance) - BigInt(depositAmount)).toString(),
    );
    assert.equal(
      finalTreasuryBalance.toString(),
      (BigInt(initialTreasuryBalance) + BigInt(depositAmount)).toString(),
    );

    const state = await program.account.state.fetch(stateAccount);
    console.log('State:', state);

    console.log('Deposit and swap executed successfully');
  });

  /*
  // it("Deposits a token with a third-party fee payer", async () => {
  //   // Initialize token mint, user token account, and treasury token account
  //   const mint = await createMint(
  //     provider.connection,
  //     provider.wallet.payer,
  //     provider.wallet.publicKey,
  //     null,
  //     9
  //   );

  //   const userTokenAccount = await createAccount(
  //     provider.connection,
  //     provider.wallet.payer,
  //     mint,
  //     provider.wallet.publicKey
  //   );

  //   const swapAccount1 = await createAccount(
  //     provider.connection,
  //     provider.wallet.payer,
  //     mint,
  //     swapAccount.publicKey
  //   );

  //   const treasuryTokenAccount = await createAccount(
  //     provider.connection,
  //     provider.wallet.payer,
  //     mint,
  //     treasuryAccount.publicKey
  //   );

  //   // Mint tokens to user's token account
  //   await mintTo(
  //     provider.connection,
  //     provider.wallet.payer,
  //     mint,
  //     userTokenAccount,
  //     provider.wallet.publicKey,
  //     1000000000 // 1 billion tokens (assuming 9 decimals)
  //   );

  //   // Add token to allowed list
  //   await program.methods
  //     .addToken(mint)
  //     .accounts({
  //       state: stateAccount,
  //       owner: newOwner.publicKey,
  //     })
  //     .signers([newOwner])
  //     .rpc();

  //   const depositAmount = 500; // Example deposit amount

  //   // Get initial balances
  //   const initialUserBalance = (
  //     await getAccount(provider.connection, userTokenAccount)
  //   ).amount;
  //   const initialTreasuryBalance = (
  //     await getAccount(provider.connection, treasuryTokenAccount)
  //   ).amount;

  //   // Airdrop SOL to fee payer for covering transaction fees
  //   // await provider.connection.requestAirdrop(
  //   //   feePayer.publicKey,
  //   //   LAMPORTS_PER_SOL
  //   // );

  //   // Create the transaction
  //   let tx = new Transaction().add(
  //     await program.methods
  //       .depositAndSwap(new anchor.BN(depositAmount))
  //       .accounts({
  //         state: stateAccount,
  //         treasury: treasuryTokenAccount,
  //         userTokenAccount,
  //         //swapAccount: swapAccount1,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         userAuthority: provider.wallet.publicKey,
  //       })
  //       .instruction()
  //   );

  //   tx.feePayer = feePayer.publicKey;

  //   const recentBlockhash = (await provider.connection.getLatestBlockhash())
  //     .blockhash;
  //   tx.recentBlockhash = recentBlockhash;

  //   // Sign the transaction with the fee payer's keypair
  //   tx.partialSign(feePayer);

  //   // **NEW: Sign the transaction with the user's wallet (userAuthority)**
  //   tx.partialSign(provider.wallet.payer);

  //   // Estimate the fee for the transaction
  //   const feeCalculator = await provider.connection.getFeeForMessage(
  //     tx.compileMessage()
  //   );
  //   const estimatedFee = feeCalculator.value / LAMPORTS_PER_SOL;

  //   console.log("Estimated transaction fee:", estimatedFee, "SOL");

  //   // Submit the transaction
  //   const signature = await provider.connection.sendTransaction(
  //     tx,
  //     [feePayer, provider.wallet.payer], // Include both the fee payer and userAuthority as signers
  //     {
  //       skipPreflight: false,
  //       preflightCommitment: "confirmed",
  //     }
  //   );

  //   await provider.connection.confirmTransaction(signature);

  //   // Get final balances
  //   const finalUserBalance = (
  //     await getAccount(provider.connection, userTokenAccount)
  //   ).amount;
  //   const finalTreasuryBalance = (
  //     await getAccount(provider.connection, treasuryTokenAccount)
  //   ).amount;

  //   // Verify balances
  //   assert.equal(
  //     finalUserBalance.toString(),
  //     (BigInt(initialUserBalance) - BigInt(depositAmount)).toString()
  //   );
  //   assert.equal(
  //     finalTreasuryBalance.toString(),
  //     (BigInt(initialTreasuryBalance) + BigInt(depositAmount)).toString()
  //   );
  //   console.log("initialUserBalance", initialUserBalance);
  //   console.log("initialTreasuryBalance", initialTreasuryBalance);
  //   console.log("finalUserBalance", finalUserBalance);
  //   console.log("finalTreasuryBalance", finalTreasuryBalance);
  //   getBalance(connection, feePayer.publicKey).then((balance) => {
  //     console.log("finalFeePayerBalance:", balance, "SOL");
  //   });
  //   console.log("Deposit with third-party fee payer executed successfully");
  // });
*/
});

async function initializeTokenAccount(provider, mint, owner) {
  const connection = provider.connection;
  const wallet = provider.wallet;

  // Derive the associated token account address
  const userTokenAccount = await getAssociatedTokenAddress(
    mint, // Mint address (e.g., USDC)
    owner.publicKey, // The owner of the token account
    true,
    TOKEN_PROGRAM_ID, // SPL Token Program ID
    ASSOCIATED_TOKEN_PROGRAM_ID, // Associated Token Program ID
  );

  // Check if the account already exists
  const accountInfo = await connection.getAccountInfo(userTokenAccount);
  if (accountInfo === null) {
    console.log('Token account does not exist. Creating it...');

    // Create the associated token account
    const tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        owner.publicKey, // Payer of the transaction
        userTokenAccount,
        owner.publicKey,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );

    // Send the transaction to create the account
    await provider.sendAndConfirm(tx, [owner]);

    console.log('User token account created:', userTokenAccount.toString());
  } else {
    console.log(
      'User token account already exists:',
      userTokenAccount.toString(),
    );
  }

  return userTokenAccount;
}

const saveKeypairToFile = (keypair: Keypair, filepath: string) => {
  const keypairJson = {
    publicKey: keypair.publicKey.toString(),
    secretKey: Array.from(keypair.secretKey),
  };
  fs.writeFileSync(filepath, JSON.stringify(keypairJson, null, 2));
};
