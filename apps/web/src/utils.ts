export const shortenWalletAddress = (walletAddress: string) => {
  if (!walletAddress || walletAddress.length < 10) return walletAddress;

  return walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);
};
