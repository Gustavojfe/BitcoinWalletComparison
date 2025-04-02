/**
 * GitHub repository mapping for open source wallets.
 * Maps wallet IDs (name in lowercase) to their GitHub repository URLs.
 */
export const githubRepos: Record<string, string> = {
  'alby': 'https://github.com/getAlby',
  'aqua': 'https://github.com/AquaWallet/aqua-wallet',
  'bitkit': 'https://github.com/synonymdev/bitkit',
  'blink': 'https://github.com/GaloyMoney/blink-mobile',
  'blitz': 'https://github.com/BlitzWallet/BlitzWallet',
  'blixt': 'https://github.com/hsjoberg/blixt-wallet',
  'breez': 'https://github.com/breez/breezmobile',
  'coinos': 'https://github.com/coinos/coinos-ui',
  'electrum': 'https://github.com/spesmilo/electrum',
  'muun': 'https://github.com/muun/falcon',
  'phoenix': 'https://github.com/ACINQ/phoenix',
  'primal': 'https://github.com/PrimalHQ/primal-android-app',
  'rtl': 'https://github.com/Ride-The-Lightning/RTL',
  'zeus': 'https://github.com/ZeusLN/zeus'
};

/**
 * Get the GitHub repository URL for a wallet.
 * 
 * @param walletName The name of the wallet
 * @returns The GitHub repository URL or undefined if not found
 */
export function getGitHubRepo(walletName: string): string | undefined {
  const normalizedName = walletName.toLowerCase();
  return githubRepos[normalizedName];
}