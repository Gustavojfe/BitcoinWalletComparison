/**
 * GitHub repository mapping for open source wallets.
 * Maps wallet IDs (name in lowercase) to their GitHub repository URLs.
 */
export const githubRepos: Record<string, string> = {
  'alby': 'https://github.com/getAlby/lightning-browser-extension',
  'aqua': 'https://github.com/atlantabitdevs/Aqua',
  'bitkit': 'https://github.com/bitkit-dev/Bitkit',
  'blink': 'https://github.com/stakwork/sphinx-relay',
  'blitz': 'https://github.com/blitz-wallet',
  'blixt': 'https://github.com/hsjoberg/blixt-wallet',
  'breez': 'https://github.com/breez/breezmobile',
  'coinos': 'https://github.com/coinos/coinos-ui',
  'electrum': 'https://github.com/spesmilo/electrum',
  'muun': 'https://github.com/muun/falcon',
  'phoenix': 'https://github.com/ACINQ/phoenix',
  'primal': 'https://github.com/PrimalHQ/primal-app-mobile',
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