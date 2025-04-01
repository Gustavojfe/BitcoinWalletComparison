import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import WalletTooltip from './WalletTooltip';
import FeatureTooltip from './FeatureTooltip';
import { WalletType, WalletWithFeatures, Feature, Wallet } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EyeOff, Github } from 'lucide-react';
import { useVisibility } from '@/hooks/use-visibility-context';
import { useLanguage } from '@/hooks/use-language';
import { getGitHubRepo } from '@/lib/githubRepos';

interface ComparisonTableProps {
  walletType: WalletType;
  searchTerm: string;
}

const ComparisonTable = ({ walletType, searchTerm }: ComparisonTableProps) => {
  // Use the visibility hook
  const {
    isWalletHidden,
    isFeatureHidden,
    toggleWalletVisibility,
    toggleFeatureVisibility
  } = useVisibility(walletType);
  
  // Get translation functions and language
  const { t, translateFeature, translateWallet, language } = useLanguage();

  // Fetch wallets with features
  const { data: walletsWithFeatures, isLoading: isWalletsLoading } = useQuery({
    queryKey: ['/api/wallet-features', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/wallet-features?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch wallets');
      return res.json() as Promise<WalletWithFeatures[]>;
    }
  });

  // Fetch features
  const { data: features, isLoading: isFeaturesLoading } = useQuery({
    queryKey: ['/api/features', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/features?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch features');
      return res.json() as Promise<Feature[]>;
    }
  });

  // Filter wallets based on search term and visibility
  const filteredWallets = walletsWithFeatures?.filter(wallet => {
    // Check if wallet name or description matches search
    const walletMatches = (
      wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Check if any of the wallet's features match search
    const featureMatches = wallet.features.some(feature => 
      feature.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.featureDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Include wallet if it matches search and is not hidden
    return (walletMatches || featureMatches) && !isWalletHidden(wallet.id);
  });

  if (isWalletsLoading || isFeaturesLoading) {
    return <div className="bg-card shadow rounded-lg overflow-hidden p-6">
      <Skeleton className="h-96 w-full" />
    </div>;
  }

  if (!filteredWallets || !features) {
    return <div className="bg-card shadow rounded-lg overflow-hidden p-6">
      <p className="text-center text-muted-foreground">{t('table.noData')}</p>
    </div>;
  }

  if (filteredWallets.length === 0) {
    return <div className="bg-card shadow rounded-lg overflow-hidden p-6">
      <p className="text-center text-muted-foreground">{t('table.noResults')}</p>
    </div>;
  }

  // Sort features by order
  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);
  
  // Sort wallets alphabetically by name
  const sortedWallets = [...filteredWallets].sort((a, b) => a.name.localeCompare(b.name));

  // Filter features based on visibility
  const visibleFeatures = sortedFeatures.filter(feature => {
    // Check if feature matches search term
    const featureMatchesSearch = (
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Check if any wallets match the search term
    const isWalletSearchMatch = walletsWithFeatures?.some(wallet => {
      return wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             wallet.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Only include feature if it's not hidden AND (it matches search term OR we're searching for a wallet)
    return !isFeatureHidden(feature.id) && (featureMatchesSearch || isWalletSearchMatch);
  });

  /**
   * Render feature status based on value
   * Uses the translation system via t() function for all text displayed to users
   * Translation keys are organized under "featureStatus.values" in translation files (en.json/es.json)
   * 
   * This function provides a uniform approach to translating all feature values.
   * To add a new feature value:
   * 1. Add the translation key to "featureStatus.values" in both en.json and es.json
   * 2. Add its style to "featureStatus.styles" if it needs special styling
   * 3. Add it to "featureStatus.icons" if it should display with an icon
   */
  const renderFeatureStatus = (value: string, customText?: string, featureName?: string, wallet?: Wallet): JSX.Element => {
    // Special handling for platform values - display icons instead of text
    if (featureName === "Platform") {
      return renderPlatformIcons(value, customText);
    }
    
    // Special handling for open source feature with value="yes" to show GitHub links
    if ((featureName === "openSource" || featureName === "Open Source") && value === "yes" && wallet) {
      return renderGitHubLink(wallet.name);
    }
    
    // Normalize a string to create a valid translation key
    // e.g., "Yes (GitHub)" -> "yes_github" 
    const normalizeKey = (key: string): string => {
      return key
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/g, '')  // Remove non-alphanumeric characters
        .replace(/\s+/g, '_');    // Replace spaces with underscores
    };
    
    // For all values, handle them uniformly with the same approach
    // Determine which value to use for display
    const displayValue = (value === 'custom' && customText) ? customText : value;
    
    // Normalize to create a valid translation key
    const normalizedKey = normalizeKey(displayValue);
    
    // Create a full translation key path
    const translationKey = `featureStatus.values.${normalizedKey}`;
    
    // Standard case: Get translated values with fallbacks
    const label = t(`${translationKey}.label`, undefined, displayValue);
    
    // Determine if this value uses an icon
    const useIconStr = t(`featureStatus.icons.${normalizedKey}`, undefined, "false");
    const useIcon = useIconStr === "true"; // Convert to boolean
    
    // Get style class or use default based on value
    let styleClass = '';
    
    // Check for styles in this priority order:
    // 1. Direct style for the normalized key
    const normalizedKeyStyle = t(`featureStatus.styles.${normalizedKey}`, undefined, "");
    if (normalizedKeyStyle && normalizedKeyStyle !== `featureStatus.styles.${normalizedKey}`) {
      styleClass = normalizedKeyStyle;
    } 
    // 2. Style for the raw value
    else {
      const rawValueStyle = t(`featureStatus.styles.${value}`, undefined, "");
      if (rawValueStyle && rawValueStyle !== `featureStatus.styles.${value}`) {
        styleClass = rawValueStyle;
      }
      // 3. Special categories
      else if (['lnd', 'ldk', 'core_lightning', 'eclair'].includes(value)) {
        styleClass = t('featureStatus.styles.implementation', undefined, "");
      } 
      else if (['custodial', 'ln_node', 'liquid_swap', 'on_chain_swap', 'remote_node'].includes(value)) {
        styleClass = t('featureStatus.styles.walletType', undefined, "");
      } 
      else if (value === 'custom' && customText) {
        styleClass = t('featureStatus.styles.custom', undefined, "");
      } 
      // 4. Default style
      else {
        styleClass = t('featureStatus.styles.unknown', undefined, "");
      }
    }
    
    // Extract background and text colors from the style
    const bgClass = styleClass.split(' ')[0] || 'bg-muted';
    const textClass = styleClass.split(' ')[1] || 'text-muted-foreground';
    
    // Render icon-based values (yes, no, partial, optional)
    if (useIcon) {
      if (value === 'yes') {
        return (
          <FeatureTooltip featureName={featureName} value={value} customText={customText} wallet={wallet}>
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </FeatureTooltip>
        );
      } else if (value === 'no' || value === 'not_possible') {
        return (
          <FeatureTooltip featureName={featureName} value={value} customText={customText} wallet={wallet}>
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </FeatureTooltip>
        );
      } else if (value === 'partial' || value === 'optional') {
        return (
          <FeatureTooltip featureName={featureName} value={value} customText={customText} wallet={wallet}>
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-500/20">
              <span className="text-xs font-medium text-orange-500">
                {label}
              </span>
            </span>
          </FeatureTooltip>
        );
      } else if (value === 'does_not_apply') {
        return (
          <FeatureTooltip featureName={featureName} value={value} customText={customText} wallet={wallet}>
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </span>
          </FeatureTooltip>
        );
      }
    }
    
    // For all other values, render as a text pill
    return (
      <FeatureTooltip featureName={featureName} value={value} customText={customText} wallet={wallet}>
        <span className={`inline-flex items-center justify-center h-6 px-2 rounded-md ${bgClass}`}>
          <span className={`text-xs font-medium ${textClass}`}>
            {label}
          </span>
        </span>
      </FeatureTooltip>
    );
  };
  
  /**
   * Render GitHub link for open source wallets
   * Uses the githubRepos mapping to find the repository URL
   */
  const renderGitHubLink = (walletName: string): JSX.Element => {
    const repoUrl = getGitHubRepo(walletName);
    if (!repoUrl) {
      // If no GitHub repo is found, just show a standard "Yes" value
      return renderFeatureStatus('yes');
    }
    
    // Get the translated label and title from the translation files
    const label = t('featureStatus.values.yes_github.label', undefined, 'Yes');
    
    return (
      <FeatureTooltip value="yes_github" featureName="openSource" wallet={{ id: 0, name: walletName, website: '', description: '', type: 'lightning', order: 0 }}>
        <a 
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <span className="flex items-center text-xs font-medium text-primary gap-1">
            <Github className="h-3.5 w-3.5" />
            {label}
          </span>
        </a>
      </FeatureTooltip>
    );
  };
  
  /**
   * Render platform-specific icons
   * Maps platform values to corresponding icons
   */
  const renderPlatformIcons = (value: string, customText?: string): JSX.Element => {
    // Determine which value to use
    const platformValue = (value === 'custom' && customText) ? customText : value;
    
    // Split platforms if there are multiple separated by commas
    const platforms = platformValue.split(',').map(p => p.trim().toLowerCase());
    
    // Create a translated list of platform names for the tooltip
    const translatedPlatformsList = platforms
      .map(platform => {
        // Try to get translation for this platform, fall back to capitalized platform name
        const platformKey = platform === 'chrome extension' ? 'chrome' : platform;
        const translation = t(`platforms.${platformKey}`, {}, platform.charAt(0).toUpperCase() + platform.slice(1));
        return translation;
      })
      .join(', ');
    
    return (
      <div 
        className="flex flex-wrap gap-1" 
        data-tooltip={translatedPlatformsList}
        // Use both title and data-tooltip attributes for wider browser support
        title={translatedPlatformsList}
      >
        {platforms.map((platform, index) => {
          // Return the appropriate icon based on the platform
          if (platform === 'web') {
            // Get translated platform name
            const platformName = t('platforms.web');
            return (
              <WalletTooltip key={index} title={platformName} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </span>
              </WalletTooltip>
            );
          } else if (platform === 'android') {
            // Get translated platform name
            const platformName = t('platforms.android');
            return (
              <WalletTooltip key={index} title={platformName} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full">
                  {/* Android green mustard icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="#a4c639">
                    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
                  </svg>
                </span>
              </WalletTooltip>
            );
          } else if (platform === 'ios') {
            // Get translated platform name
            const platformName = t('platforms.ios');
            return (
              <WalletTooltip key={index} title={platformName} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full">
                  {/* Apple logo that adapts to dark/light mode */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                </span>
              </WalletTooltip>
            );
          } else if (platform === 'desktop') {
            // Get translated platform name
            const platformName = t('platforms.desktop');
            return (
              <WalletTooltip key={index} title={platformName} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </span>
              </WalletTooltip>
            );
          } else if (platform === 'linux') {
            // Get translated platform name
            const platformName = t('platforms.linux');
            return (
              <WalletTooltip key={index} title={platformName} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.503 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.1 2.197-1.377 4.296-2.471 6.252-.818 1.372-1.656 2.691-2.12 4.214-.401 1.318-.65 2.622-.672 3.977-.1.851.097 1.716.363 2.533.952 2.936 3.893 5.335 6.924 5.705 1.482.181 3.064.154 4.518-.317 1.554-.494 2.949-1.425 4.05-2.639 1.153-1.265 2.106-2.723 2.804-4.294.527-1.198 1.038-2.428 1.322-3.703.315-1.251.396-2.554.325-3.841-.295-4.703-4.936-7.924-9.494-7.916-.21 0-.42.011-.63.036-1.021.131-1.941.548-2.595 1.163-.764.694-1.23 1.595-1.41 2.543-.343 1.855.099 3.94.809 5.649.396.929 1.064 1.845.548 2.8-.976 1.781-3.204 1.911-4.699.947-.928-.596-1.45-1.617-1.612-2.647-.131-.701-.323-1.429-.162-2.146.079-.329.189-.671.33-1.022.244-.549.254-.978.066-1.327-.179-.315-.507-.532-.872-.565-3.22-.287-4.494 2.348-5.121 4.996-.63 2.212-.516 4.559.316 6.709.237.475.503.938.826 1.367.318.422.676.805 1.069 1.149 3.39 2.954 8.823 2.638 11.634-1.006.612-.802 1.056-1.736 1.377-2.72.176-.548.352-1.109.512-1.666.278-.918.527-1.834.934-2.71.496-1.077 1.325-1.839 2.487-2.004 1.375-.203 2.787.329 3.766 1.339 1.024 1.029 1.621 2.355 1.803 3.769.095.581.116 1.172.064 1.757-.176 1.917-1.01 3.725-2.184 5.288-.32.449-.72.856-1.004 1.327-.323.528-.344 1.192.002 1.711.588.883 1.844 1.15 2.792.62.491-.273.891-.675 1.199-1.134.307-.459.536-.955.704-1.47.34-1.022.476-2.103.408-3.165-.072-1.543-.572-3.063-1.41-4.381-.87-1.403-2.147-2.544-3.706-3.138-1.275-.507-2.67-.631-4.008-.435-1.222.193-2.422.65-3.419 1.393-.272.207-.531.437-.779.68-.478.487-.835 1.066-1.041 1.708-.204.642-.25 1.328-.128 1.992.188 1.644.836 3.202 1.72 4.628.624 1.003 1.346 1.935 1.887 2.983.82 1.645.538 3.531-.391 5.024-.84 1.323-2.222 2.238-3.755 2.457-1.503.194-3.102-.202-4.275-1.099-1.249-.974-2.204-2.344-2.506-3.869-.261-1.321-.095-2.707.513-3.904.158-.307.336-.596.525-.878l.322-.48c.122-.18.272-.414.313-.631.07-.292.027-.547-.136-.732-.14-.148-.356-.248-.599-.24-.556.026-1.143.394-1.538.807-.618.646-1.038 1.461-1.4 2.28-.909 2.059-.997 4.519.039 6.547.66 1.37 1.813 2.529 3.26 3.143 1.379.574 2.933.612 4.353.124 1.39-.484 2.638-1.417 3.487-2.627.954-1.336 1.45-2.994 1.359-4.648-.078-1.331-.571-2.631-1.309-3.78-.478-.752-.99-1.468-1.423-2.238-.76-1.364-1.33-2.968-1.203-4.559.08-.976.404-1.934 1.047-2.647.635-.689 1.493-1.126 2.405-1.226.96-.1 1.968.136 2.806.653 1.017.631 1.764 1.673 2.05 2.823.125.477.174.964.152 1.456-.066 1.4-.707 2.833-1.79 3.768-.981.848-2.275 1.264-3.595 1.164-.629-.051-1.258-.216-1.782-.542-.271-.162-.546-.373-.693-.622-.113-.185-.154-.396-.129-.598.035-.209.135-.411.274-.576.222-.268.533-.457.849-.58.503-.2 1.033-.331 1.545-.515.844-.298 1.743-.742 2.268-1.489.344-.489.432-1.075.272-1.654-.165-.571-.534-1.031-1.086-1.272-.651-.28-1.363-.271-2.046-.072-.768.219-1.427.67-2.097 1.124-.325.219-.661.4-.986.612-.606.384-1.264.645-1.985.677-1.617.06-3.115-.754-4.018-1.932-.955-1.243-1.431-2.818-1.319-4.385.132-1.818.957-3.556 2.298-4.819 1.339-1.264 3.125-1.956 4.979-1.892 1.814.062 3.578.787 4.864 2.081 1.005 1.012 1.729 2.289 2.059 3.644.239.95.24 1.955-.09 2.885-.318.905-.86 1.706-1.492 2.413-.348.379-.726.751-1.09 1.112-.363.36-.65.812-.686 1.321-.039.646.241 1.349.672 1.847.431.498 1.066.844 1.711.92.674.082 1.351-.08 1.932-.43.631-.386 1.148-.918 1.555-1.5.406-.583.723-1.228.99-1.883.27-.665.491-1.35.646-2.049.364-1.627.446-3.347.13-4.982-.327-1.608-1.075-3.146-2.098-4.445-1.877-2.398-4.812-3.927-7.904-3.926-.24 0-.48.007-.72.022-1.284.072-2.57.337-3.796.786-1.218.452-2.372 1.103-3.395 1.921-1.008.806-1.849 1.794-2.548 2.872-1.372 2.091-2.197 4.532-2.255 7.006-.058 2.419.705 4.853 2.184 6.813 1.393 1.975 3.434 3.566 5.811 4.289 2.354.723 4.968.63 7.187-.475 1.404-.697 2.66-1.789 3.504-3.188.844-1.397 1.286-3.074 1.244-4.759-.032-1.409-.456-2.812-1.224-4.015-1.001-1.556-2.538-2.786-4.286-3.395-1.751-.606-3.651-.615-5.417-.05-1.847.58-3.508 1.75-4.627 3.404-.834 1.241-1.316 2.727-1.385 4.242-.071 1.526.259 3.077 1.007 4.413.739 1.359 1.858 2.508 3.245 3.234 1.427.739 3.052.902 4.599.569 1.528-.346 2.974-1.258 3.97-2.543.992-1.277 1.559-2.929 1.596-4.594.037-1.656-.49-3.33-1.499-4.626-1.004-1.299-2.464-2.232-4.069-2.574-3.361-.7-6.985 1.21-8.491 4.292-.852 1.749-1.091 3.816-.675 5.715.419 1.903 1.484 3.701 3.042 4.875 1.526 1.154 3.404 1.727 5.281 1.621 1.884-.117 3.708-.959 5.074-2.349 1.367-1.39 2.267-3.227 2.597-5.158.328-1.921.092-3.906-.67-5.705-.803-1.866-2.179-3.462-3.905-4.521-1.749-1.078-3.775-1.623-5.79-1.593-2.019.026-4.014.664-5.727 1.805-1.724 1.137-3.103 2.739-3.957 4.589-1.865 4.012-.803 8.878 2.715 11.964 1.737 1.516 3.947 2.499 6.26 2.804 2.29.3 4.645-.024 6.744-1.006 2.101-.977 3.926-2.593 5.106-4.642 2.389-4.012 2.268-9.194-.33-13.064-1.211-1.834-2.864-3.353-4.806-4.418-1.924-1.063-4.086-1.683-6.294-1.866-4.489-.349-9.106 1.019-12.603 3.862-1.74 1.402-3.248 3.14-4.350 5.104-1.106 1.956-1.829 4.138-2.114 6.372-.351 2.952.11 5.95 1.087 8.747.983 2.791 2.504 5.338 4.458 7.557 1.947 2.219 4.33 4.129 7.025 5.522 2.697 1.396 5.685 2.261 8.708 2.344.275.007.55.01.825.01 2.885 0 5.732-.613 8.474-1.649 2.738-1.039 5.251-2.547 7.45-4.376 5.79-4.872 9.38-12.093 9.802-19.597.42-7.52-2.349-15.133-7.542-20.58-5.133-5.446-12.329-8.608-19.77-8.65-.228 0-.455.006-.682.016-5.415.179-10.771 1.994-15.175 5.018-4.409 3.001-7.967 7.137-10.37 11.842-1.101 2.14-1.978 4.388-2.636 6.682-.334 1.147-.624 2.31-.871 3.48-.224 1.041-.398 2.091-.537 3.142-.16 1.233-.283 2.478-.344 3.721-.058 1.239-.048 2.48.01 3.722.059 1.237.166 2.476.318 3.71.149 1.222.354 2.438.598 3.648.451 2.203 1.031 4.387 1.853 6.494 1.635 4.211 4.149 8.147 7.463 11.297 3.309 3.133 7.385 5.478 11.852 6.718 4.477 1.233 9.258 1.351 13.823.345 4.58-1.012 8.935-3.154 12.601-6.261 3.665-3.101 6.638-7.205 8.637-11.834.999-2.316 1.741-4.757 2.211-7.254.265-1.25.459-2.515.58-3.787.06-.637.107-1.275.129-1.916.087-1.87.015-3.72-.211-5.55-.246-1.993-.717-3.97-1.405-5.87-.694-1.9-1.597-3.712-2.682-5.414-2.155-3.385-5.034-6.326-8.415-8.582-3.376-2.261-7.287-3.821-11.351-4.521-2.024-.345-4.086-.428-6.128-.248-2.037.179-4.054.6-5.978 1.244-3.92 1.297-7.463 3.461-10.408 6.222-.726.68-1.407 1.408-2.052 2.165-.641.769-1.242 1.574-1.798 2.396-.554.818-1.059 1.663-1.533 2.518-.47.859-.908 1.733-1.304 2.619-.796 1.767-1.428 3.590-1.896 5.445-.467 1.855-.795 3.739-.962 5.629-.167 1.887-.175 3.825-.023 5.72.151 1.889.473 3.778.955 5.62.964 3.704 2.537 7.239 4.611 10.426 2.072 3.19 4.634 6.014 7.533 8.413 5.828 4.792 13.082 7.807 20.579 8.511.606.056 1.213.095 1.822.117.303.009.606.015.91.015 2.426 0 4.844-.292 7.208-.851 4.731-1.142 9.219-3.592 12.963-6.987 3.75-3.389 6.809-7.742 8.766-12.619 1.956-4.878 2.822-10.26 2.428-15.597-.431-5.345-2.136-10.565-4.858-15.112-2.713-4.538-6.48-8.463-11.028-11.305-4.532-2.856-9.787-4.597-15.207-5.042-.47-.036-.946-.065-1.42-.08-.284-.011-.569-.016-.853-.016-1.5 0-2.994.139-4.46.387-1.467.248-2.913.606-4.326 1.061-2.827.918-5.548 2.251-8.038 4.019-2.501 1.749-4.756 3.926-6.66 6.409-1.909 2.474-3.469 5.252-4.602 8.19-1.14 2.935-1.845 6.033-2.063 9.167-.221 3.135.033 6.315.795 9.347.753 3.037 1.993 5.94 3.688 8.565 1.691 2.625 3.844 4.968 6.35 6.888 2.501 1.92 5.361 3.418 8.385 4.386 3.029.966 6.224 1.398 9.372 1.283.789-.028 1.582-.092 2.373-.187" />
                  </svg>
                </span>
              </WalletTooltip>
            );
          } else if (platform === 'mac' || platform === 'macos') {
            // Get translated platform name
            const platformName = t(platform === 'mac' ? 'platforms.mac' : 'platforms.macos');
            return (
              <WalletTooltip key={index} title={platformName} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full">
                  {/* Apple logo that adapts to dark/light mode */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                </span>
              </WalletTooltip>
            );
          } else if (platform === 'windows') {
            // Get translated platform name
            const platformName = t('platforms.windows');
            return (
              <WalletTooltip key={index} title={platformName} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full">
                  {/* Windows logo in Windows blue */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 448 512" fill="#0078d7">
                    <path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z"/>
                  </svg>
                </span>
              </WalletTooltip>
            );
          } else if (platform === 'chrome' || platform === 'chrome extension') {
            // Get translated platform name
            const platformName = t('platforms.chrome');
            return (
              <WalletTooltip key={index} title={platformName} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full">
                  {/* Chrome logo */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="#f1f1f1" />
                    <circle cx="50" cy="50" r="30" fill="#4285f4" />
                    <circle cx="50" cy="50" r="15" fill="#f1f1f1" />
                    <path d="M85,50H50" stroke="#ea4335" strokeWidth="15" strokeLinecap="round" />
                    <path d="M50,85L26,50" stroke="#34a853" strokeWidth="15" strokeLinecap="round" />
                    <path d="M26,50L61,15" stroke="#fbbc05" strokeWidth="15" strokeLinecap="round" />
                  </svg>
                </span>
              </WalletTooltip>
            );
          } else {
            // For any other platform, return a generic icon
            return (
              <WalletTooltip key={index} title={platform} description="">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </span>
              </WalletTooltip>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="bg-card shadow rounded-lg overflow-visible">
      <div className="overflow-auto max-h-[80vh] overflow-y-visible">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted sticky top-0 z-20">
            <tr>
              <th scope="col" className="sticky left-0 top-0 z-30 bg-muted px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider min-w-[200px]">
                {t('common.wallets')}
              </th>
              {visibleFeatures.map((feature) => (
                <th 
                  key={feature.id} 
                  scope="col" 
                  className="sticky top-0 z-20 bg-muted px-6 py-3 text-center text-xs font-medium text-muted-foreground tracking-wider min-w-[140px] group"
                >
                  <div className="flex items-center justify-center space-x-1">
                    {(() => {
                      const translatedFeature = translateFeature(feature);
                      return (
                        <WalletTooltip 
                          title={translatedFeature.name} 
                          description={translatedFeature.description}
                        >
                          <span>{translatedFeature.name}</span>
                        </WalletTooltip>
                      );
                    })()}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                      onClick={() => toggleFeatureVisibility(feature.id)}
                      title={`${t('common.hide')} ${translateFeature(feature).name}`}
                    >
                      <EyeOff className="h-3 w-3" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedWallets.map((wallet) => (
              <tr key={wallet.id} className="hover:bg-accent group">
                <td className="sticky left-0 z-10 bg-card px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground group-hover:bg-accent">
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const translatedWallet = translateWallet(wallet);
                      return (
                        <WalletTooltip 
                          title={translatedWallet.name} 
                          description={translatedWallet.description}
                        >
                          <a 
                            href={wallet.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-primary"
                          >
                            {translatedWallet.name}
                          </a>
                        </WalletTooltip>
                      );
                    })()}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleWalletVisibility(wallet.id)}
                      title={`${t('common.hide')} ${translateWallet(wallet).name}`}
                    >
                      <EyeOff className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
                {visibleFeatures.map((feature) => {
                  const walletFeature = wallet.features.find(
                    (f) => f.featureId === feature.id
                  );
                  
                  return (
                    <td key={`${wallet.id}-${feature.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {walletFeature 
                        ? renderFeatureStatus(walletFeature.value, walletFeature.customText, feature.name, wallet) 
                        : renderFeatureStatus('no')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;