import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import WalletTooltip from './WalletTooltip';
import FeatureTooltip from './FeatureTooltip';
import PlatformIcons from './PlatformIcons';
import GitHubLink from './GitHubLink';
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
      // Use our reusable PlatformIcons component for all platform display
      return <PlatformIcons value={value} customText={customText} />;
    }
    
    // Special handling for open source feature with value="yes" to show GitHub links
    if ((featureName === "openSource" || featureName === "Open Source") && value === "yes" && wallet) {
      const githubLink = <GitHubLink walletName={wallet.name} wallet={wallet} />;
      return githubLink || renderFeatureStatus('yes');
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
      else if (['send_only', 'send', 'api', 'lnd', 'cln', 'core_lightning'].includes(value)) {
        // No special style for these values
        styleClass = "";
      }
      else if (['custodial', 'ln_node', 'liquid_swap', 'on_chain_swap', 'remote_node'].includes(value)) {
        styleClass = t('featureStatus.styles.walletType', undefined, "");
      } 
      else if (value === 'custom' && customText) {
        // Check if customText is one of our unstyled values that should have no background
        const lowercaseCustomText = customText.toLowerCase();
        const noStyleValues = ['api', 'send only', 'send', 'lnd', 'cln', 'core lightning'];
        
        // Exact match for whole string
        if (noStyleValues.includes(lowercaseCustomText)) {
          styleClass = "";
        }
        // Check if customText contains any of our unstyled values
        else if (noStyleValues.some(val => lowercaseCustomText === val || lowercaseCustomText.startsWith(val + ' ') || lowercaseCustomText.includes(' ' + val))) {
          styleClass = "";
        }
        // Otherwise use custom style
        else {
          styleClass = t('featureStatus.styles.custom', undefined, "");
        }
      } 
      // 4. Default style
      else {
        styleClass = t('featureStatus.styles.unknown', undefined, "");
      }
    }
    
    // Extract background and text colors from the style
    const bgClass = styleClass ? (styleClass.split(' ')[0] || 'bg-muted') : '';
    const textClass = styleClass ? (styleClass.split(' ')[1] || 'text-muted-foreground') : 'text-foreground';
    
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
      }
    }
    
    // For all other values, render as a text pill or plain text
    return (
      <FeatureTooltip featureName={featureName} value={value} customText={customText} wallet={wallet}>
        {bgClass ? (
          <span className={`inline-flex items-center justify-center h-6 px-2 rounded-md ${bgClass}`}>
            <span className={`text-xs font-medium ${textClass}`}>
              {label}
            </span>
          </span>
        ) : (
          <span className={`text-xs font-medium ${textClass}`}>
            {label}
          </span>
        )}
      </FeatureTooltip>
    );
  };

  // Filter visible features based on search and visibility settings
  const visibleFeatures = sortedFeatures.filter(feature => {
    // When searching for a wallet name, show all features for that wallet
    const isWalletSearchMatch = searchTerm.length > 0 && filteredWallets.some(wallet => 
      wallet.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Check if feature matches search term
    const featureMatchesSearch = searchTerm.length === 0 || 
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Only include feature if it's not hidden AND (it matches search term OR we're searching for a wallet)
    return !isFeatureHidden(feature.id) && (featureMatchesSearch || isWalletSearchMatch);
  });

  return (
    <div className="bg-card shadow rounded-lg overflow-hidden">
      <div className="overflow-auto max-h-[80vh]">
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
                            : renderFeatureStatus('unknown')}
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