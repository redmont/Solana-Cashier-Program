import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { SolanaCashier } from '../target/types/solana_cashier';
const IDL = require('../target/idl/solana_cashier.json');
import 'dotenv/config';
import * as fs from 'fs';
const envExports = require('../exports.json');

import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { assert } from 'chai';
import {
  TOKEN_PROGRAM_ID,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

import base58 from 'bs58';

let heliusRpcUrl;
let usdcMintAddress;
const devnetUsdcMintAddress = process.env.DEVNET_USDC_MINT_ADDRESS;
const mainnetUsdcMintAddress = process.env.MAINNET_USDC_MINT_ADDRESS;
const testUserPrivateKey = process.env.PAYER_PRIVATE_KEY;
const treasuryAccountAddress = process.env.TREASURY_ACCOUNT;

const signerAccount = Keypair.fromSecretKey(base58.decode(testUserPrivateKey));
const treasuryAccount = new PublicKey(treasuryAccountAddress);

describe('solana_cashier', () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.SolanaCashier as Program<SolanaCashier>;

  const provider = anchor.AnchorProvider.env();

  const cluster = provider.connection.rpcEndpoint.includes('devnet')
    ? 'devnet'
    : 'mainnet-beta';

  console.log('cluster', cluster);

  usdcMintAddress =
    cluster === 'devnet' ? devnetUsdcMintAddress : mainnetUsdcMintAddress;

  const usdcMint = new PublicKey(usdcMintAddress);

  heliusRpcUrl = provider.connection.rpcEndpoint;

  const newOwner = provider.wallet;

  var stateAccount: PublicKey;

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
      envExports[cluster]?.programId === program.programId.toString() &&
      envExports[cluster]?.stateAccount
    ) {
      console.log('Program already initialized');
      stateAccount = new PublicKey(envExports[cluster].stateAccount);
      return;
    }

    const stateAccountKeypair = Keypair.generate();
    stateAccount = stateAccountKeypair.publicKey;

    console.log('Initializing program: ', program.programId.toString());
    console.log('treasuryAccount', treasuryAccount.toString());
    console.log('Deployer Account:', provider.wallet.publicKey.toString());
    console.log('State Account:', stateAccount.toString());

    await program.methods
      .initialize(treasuryAccount)
      .accounts({
        state: stateAccount,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([stateAccountKeypair])
      .rpc();

    console.log('Program initialized successfully');

    exportProgramInfo(
      cluster,
      stateAccount.toString(),
      program.programId.toString(),
    );
    console.log('Program info exported successfully');
  });

  if (cluster === 'devnet') {
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
  }

  it('Sets a new treasury address', async () => {
    // Derive the associated USDC token account address of treasury account
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      treasuryAccount,
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
      .rpc();

    const state = await program.account.state.fetch(stateAccount);
    assert.ok(state.treasury.equals(treasuryTokenAccount));
    console.log(
      'Treasury address set successfully ',
      state.treasury.toString(),
    );
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
        .rpc();

      console.log(`Token ${token.toString()} removed successfully`);
    }

    // Verify that the inTokens array is now empty
    state = await program.account.state.fetch(stateAccount);
    assert.ok(state.inTokens.length === 0);
    console.log('All tokens removed successfully');
  });

  if (cluster === 'devnet') {
    it('Allows and disallows tokens', async () => {
      const tokenMint = Keypair.generate().publicKey;

      // Allow the token
      await program.methods
        .addToken(tokenMint)
        .accounts({
          state: stateAccount,
          owner: newOwner.publicKey,
        })
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
        .rpc();

      state = await program.account.state.fetch(stateAccount);
      assert.ok(!state.inTokens.some((token) => token.equals(tokenMint)));
      console.log('Token disallowed successfully');
    });
  }

  it('Allows USDC usdcMint token', async () => {
    // Allow the token
    await program.methods
      .addToken(usdcMint)
      .accounts({
        state: stateAccount,
        owner: newOwner.publicKey,
      })
      .rpc();

    const state = await program.account.state.fetch(stateAccount);
    assert.ok(state.inTokens.some((token) => token.equals(usdcMint)));
    console.log('USDC Token mint allowed successfully');
    console.log(state);
  });

  it('Initialize USDC associated token account in treasury', async () => {
    // Derive the associated USDC token account address of treasury account

    const treasuryUsdcTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      signerAccount,
      usdcMint,
      treasuryAccount,
    );

    console.log(
      'treasury USDC token account initialized successfully',
      treasuryUsdcTokenAccount.address.toString(),
    );
  });

  if (cluster === 'devnet') {
    it('Deposits a token and send it to treasury', async () => {
      // Derive the associated USDC token account address of user

      const userUsdcTokenAccount = await initializeTokenAccount(
        provider,
        usdcMint,
        signerAccount,
      );

      console.log(
        'user USDC token account initialized successfully',
        userUsdcTokenAccount.toString(),
      );

      // Derive the associated USDC token account address of treasury account

      const treasuryUsdcTokenAccount = await initializeTokenAccount(
        provider,
        usdcMint,
        treasuryAccount,
      );

      console.log(
        'treasury USDC token account initialized successfully',
        treasuryUsdcTokenAccount.toString(),
      );

      // Add USDC token to allowed list
      await program.methods
        .addToken(usdcMint)
        .accounts({
          state: stateAccount,
          owner: newOwner.publicKey,
        })
        .rpc();

      console.log('USDC token added to allowed list successfully');

      const depositAmount = 5;

      // Get initial balances
      const initialUserBalance = (
        await getAccount(provider.connection, userUsdcTokenAccount)
      ).amount;

      const initialTreasuryBalance = (
        await getAccount(provider.connection, treasuryUsdcTokenAccount)
      ).amount;

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
        .rpc();

      // Get final balances
      const finalUserBalance = (
        await getAccount(provider.connection, userUsdcTokenAccount)
      ).amount;
      const finalTreasuryBalance = (
        await getAccount(provider.connection, treasuryUsdcTokenAccount)
      ).amount;

      //Verify balances
      assert.equal(
        finalUserBalance.toString(),
        (BigInt(initialUserBalance) - BigInt(depositAmount)).toString(),
      );
      assert.equal(
        finalTreasuryBalance.toString(),
        (BigInt(initialTreasuryBalance) + BigInt(depositAmount)).toString(),
      );

      console.log('Deposit and swap executed successfully');
    });
  }
});

async function initializeTokenAccount(provider, mint, owner) {
  const connection = provider.connection;
  const wallet = provider.wallet;

  // Derive the associated token account address
  const userTokenAccount = await getAssociatedTokenAddress(
    mint, // Mint address (e.g., USDC)
    owner, // The owner of the token account
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
        owner,
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

const exportProgramInfo = (
  cluster: string,
  stateAccount: string,
  programId: string,
) => {
  const filePath = `./exports.json`;
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    // Create the file with an empty object as content
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }

  let json = fs.readFileSync(filePath).toString();
  json = JSON.parse(json || '{}');
  json[cluster] = {
    stateAccount: stateAccount,
    programId: programId,
    owner: anchor.AnchorProvider.env().wallet.publicKey.toString(),
    treasuryAccount: treasuryAccount.toString(),
    rpcEndpoint: heliusRpcUrl,
    usdcMintAddress: usdcMintAddress,
    testUserAccount: signerAccount.publicKey.toString(),
    IDL: IDL,
  };
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
};
