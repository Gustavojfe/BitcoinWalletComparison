import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { WalletWithFeatures, Feature } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
import { Github } from 'lucide-react';
import FeatureTooltip from '@/components/FeatureTooltip';
import PlatformIcons from './PlatformIcons';
import GitHubLink from './GitHubLink';
import { getGitHubRepo } from '@/lib/githubRepos';

const WalletComparisonResult = () => {
  const { wallet1: wallet1Id, wallet2: wallet2Id } = useParams();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  // Fetch wallets with features
  const { data: walletsWithFeatures, isLoading: isWalletsLoading } = useQuery({
    queryKey: ['/api/wallet-features'],
    queryFn: async () => {
      const res = await fetch('/api/wallet-features');
      if (!res.ok) throw new Error('Failed to fetch wallets');
      return res.json() as Promise<WalletWithFeatures[]>;
    }
  });

  // Fetch features
  const { data: features, isLoading: isFeaturesLoading } = useQuery({
    queryKey: ['/api/features'],
    queryFn: async () => {
      const res = await fetch('/api/features');
      if (!res.ok) throw new Error('Failed to fetch features');
      return res.json() as Promise<Feature[]>;
    }
  });

  // Find the selected wallets
  const wallet1 = walletsWithFeatures?.find(w => w.id.toString() === wallet1Id);
  const wallet2 = walletsWithFeatures?.find(w => w.id.toString() === wallet2Id);

  if (isWalletsLoading || isFeaturesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!wallet1 || !wallet2 || !features) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-card p-6 shadow rounded-lg">
          <h1 className="text-xl font-bold mb-4 text-card-foreground">{t('wizard.comparisonResult')}</h1>
          <p className="text-muted-foreground mb-4">{t('table.noData')}</p>
          <Button onClick={() => navigate('/')} className="app-button">{t('common.return')}</Button>
        </div>
      </div>
    );
  }

  // Sort features by order
  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);
  
  // Normalize a string to create a valid translation key (e.g., "Yes (GitHub)" -> "yes_github")
  const normalizeKey = (key: string): string => {
    return key
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')  // Remove non-alphanumeric characters
      .replace(/\s+/g, '_');    // Replace spaces with underscores
  };


  


  // Render feature status based on value
  const renderFeatureStatus = (value: any, customText?: string, featureName?: string, wallet?: any): JSX.Element => {
    // Special cases for specific features
    if (featureName && featureName.toLowerCase() === 'platform') {
      // Use our reusable PlatformIcons component for all platform display
      return <PlatformIcons value={value} customText={customText} />;
    }
    
    if (featureName && 
        (featureName.toLowerCase() === 'opensource' || 
         featureName.toLowerCase() === 'open source') && 
        value === 'yes' && wallet) {
      const githubLink = <GitHubLink walletName={wallet.name} wallet={wallet} />;
      return githubLink || renderFeatureStatus('yes');
    }
    
    // For all other features, use the standard display logic
    // Determine which value to use for display and tooltips
    const displayValue = (value === 'custom' && customText) ? customText : value;
    
    // Normalize to create a valid translation key
    const normalizedKey = normalizeKey(displayValue);
    
    // Get translation for the value label
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="bg-card p-6 shadow rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-xl font-bold mb-2 sm:mb-0 text-card-foreground">{t('wizard.comparisonResult')}</h1>
          <Button onClick={() => navigate('/')} className="app-button">{t('common.return')}</Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-1">
            <h2 className="font-medium text-foreground">{t('wizard.feature')}</h2>
          </div>
          <div className="col-span-1">
            <h2 className="font-medium text-foreground text-center">
              <a 
                href={wallet1.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary" 
                title={t('common.website')}
              >
                {wallet1.name}
              </a>
            </h2>
          </div>
          <div className="col-span-1">
            <h2 className="font-medium text-foreground text-center">
              <a 
                href={wallet2.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary"
                title={t('common.website')}
              >
                {wallet2.name}
              </a>
            </h2>
          </div>
        </div>

        <div className="divide-y divide-border">
          {sortedFeatures.map(feature => {
            const wallet1Feature = wallet1.features.find(f => f.featureId === feature.id);
            const wallet2Feature = wallet2.features.find(f => f.featureId === feature.id);

            return (
              <div key={feature.id} className="grid grid-cols-3 gap-4 py-4">
                <div className="col-span-1">
                  <div className="font-medium text-foreground">{feature.name}</div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  {wallet1Feature 
                    ? renderFeatureStatus(wallet1Feature.value, wallet1Feature.customText, feature.name, wallet1) 
                    : renderFeatureStatus('unknown')}
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  {wallet2Feature 
                    ? renderFeatureStatus(wallet2Feature.value, wallet2Feature.customText, feature.name, wallet2) 
                    : renderFeatureStatus('unknown')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WalletComparisonResult;
