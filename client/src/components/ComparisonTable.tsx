import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import WalletTooltip from './WalletTooltip';
import { WalletType, WalletWithFeatures, Feature } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EyeOff } from 'lucide-react';
import { useVisibility } from '@/hooks/use-visibility-context';
import { useLanguage } from '@/hooks/use-language';

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
  const renderFeatureStatus = (value: string, customText?: string, featureName?: string) => {
    // Special handling for platform values - display icons instead of text
    if (featureName === "Platform") {
      return renderPlatformIcons(value, customText);
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
    
    // We've removed special handling for comma-separated values to provide a uniform approach
    // All values are now processed through the same path
    
    // Standard case: Get translated values with fallbacks
    const label = t(`${translationKey}.label`, undefined, displayValue);
    const title = t(`${translationKey}.title`, undefined, displayValue);
    
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
          <span 
            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20"
            title={title}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        );
      } else if (value === 'no' || value === 'not_possible') {
        return (
          <span 
            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive/20"
            title={title}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        );
      } else if (value === 'partial' || value === 'optional') {
        return (
          <span 
            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-500/20"
            title={title}
          >
            <span className="text-xs font-medium text-orange-500">
              {label}
            </span>
          </span>
        );
      }
    }
    
    // For all other values, render as a text pill
    return (
      <span 
        className={`inline-flex items-center justify-center h-6 px-2 rounded-md ${bgClass}`}
        title={title}
      >
        <span className={`text-xs font-medium ${textClass}`}>
          {label}
        </span>
      </span>
    );
  };
  
  /**
   * Render platform-specific icons
   * Maps platform values to corresponding icons
   */
  const renderPlatformIcons = (value: string, customText?: string) => {
    // Determine which value to use
    const platformValue = (value === 'custom' && customText) ? customText : value;
    
    // Split platforms if there are multiple separated by commas
    const platforms = platformValue.split(',').map(p => p.trim().toLowerCase());
    
    return (
      <div className="flex flex-wrap gap-1" title={platformValue}>
        {platforms.map((platform, index) => {
          // Return the appropriate icon based on the platform
          if (platform === 'web') {
            return (
              <span key={index} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100" title="Web">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </span>
            );
          } else if (platform === 'android') {
            return (
              <span key={index} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100" title="Android">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 16V8a7 7 0 0 1 14 0v8"></path>
                  <path d="M9 16v4"></path>
                  <path d="M15 16v4"></path>
                  <path d="M5 9h14"></path>
                </svg>
              </span>
            );
          } else if (platform === 'ios') {
            return (
              <span key={index} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100" title="iOS">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19a4 4 0 0 0 4-4"></path>
                  <path d="M15 7a4 4 0 0 0-4 4"></path>
                  <path d="M8 12h8"></path>
                  <path d="M12 8v8"></path>
                  <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                </svg>
              </span>
            );
          } else if (platform === 'desktop') {
            return (
              <span key={index} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100" title="Desktop">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </span>
            );
          } else if (platform === 'chrome' || platform === 'chrome extension') {
            return (
              <span key={index} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100" title="Chrome Extension">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                  <line x1="21.17" y1="8" x2="12" y2="8"></line>
                  <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                  <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                </svg>
              </span>
            );
          } else {
            // Default for any other platforms
            return (
              <span key={index} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100" title={platform}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </span>
            );
          }
        })}
      </div>
    );
  };

  // Filter visible features based on search and visibility settings
  const visibleFeatures = sortedFeatures.filter(feature => {
    // Check if feature matches search term
    const featureMatchesSearch = searchTerm.length === 0 || 
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Only include feature if it matches search and is not hidden
    return featureMatchesSearch && !isFeatureHidden(feature.id);
  });

  return (
    <div className="bg-card shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="align-middle inline-block min-w-full">
          <div className="overflow-hidden border-b border-border">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-muted px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[200px]">
                    {t('common.wallets')}
                  </th>
                  {visibleFeatures.map((feature) => (
                    <th 
                      key={feature.id} 
                      scope="col" 
                      className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[140px] group"
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
                    <td className="sticky left-0 z-10 bg-card px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground hover:bg-accent">
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
                            ? renderFeatureStatus(walletFeature.value, walletFeature.customText, feature.name) 
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
      </div>
    </div>
  );
};

export default ComparisonTable;
