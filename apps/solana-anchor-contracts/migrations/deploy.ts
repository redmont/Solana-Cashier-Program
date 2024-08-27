import * as anchor from '@project-serum/anchor';

module.exports = async function (provider) {
  anchor.setProvider(provider);
  const program = anchor.workspace.SolanaCashier;

  // Deploy the program
  await program.rpc.initialize({
    accounts: {
      state: program.provider.wallet.publicKey,
    },
    signers: [],
  });
};
