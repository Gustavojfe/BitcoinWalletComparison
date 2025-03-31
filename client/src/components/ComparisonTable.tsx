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

  // Render feature status based on value
  const renderFeatureStatus = (value: string, customText?: string, featureName?: string) => {
    // Debug the input values
    if (featureName === 'Channel Management' || featureName === 'Gestión de Canales') {
      console.log(`Feature cell: ${featureName}, Value: ${value}, Language: ${language}`);
    }
    
    // Translate feature value using direct dictionary
    const translateValue = (val: string): string => {
      if (!val) return '';
      
      // Direct translations for common values
      const translations: Record<string, Record<string, string>> = {
        en: {
          'yes': 'Yes',
          'no': 'No',
          'partial': 'Partial',
          'optional': 'Optional',
          'custom': 'Custom',
          'send_only': 'Send only',
          'receive_only': 'Receive only',
          'send': 'Send',
          'receive': 'Receive',
          'mandatory': 'Mandatory',
          'required': 'Required',
          'not_possible': 'Not possible',
          'unknown': 'Unknown',
          'automated': 'Automated',
          'automatic': 'Automatic',
          'manual': 'Manual',
          'lsp_assisted': 'LSP Assisted',
          'ios': 'iOS',
          'android': 'Android',
          'desktop': 'Desktop',
          'web': 'Web',
          'lnd': 'LND',
          'ldk': 'LDK',
          'core_lightning': 'Core Lightning',
          'eclair': 'Eclair',
          'custodial': 'Custodial',
          'ln_node': 'LN Node',
          'liquid_swap': 'Liquid Swap',
          'on_chain_swap': 'On-chain Swap',
          'remote_node': 'Remote Node',
          'chrome_extension': 'Chrome Extension',
          'browser_extension': 'Browser Extension',
          'web_(self-host)': 'Web (Self-Host)',
          'whatsapp': 'WhatsApp'
        },
        es: {
          'yes': 'Sí',
          'no': 'No',
          'partial': 'Parcial',
          'optional': 'Opcional',
          'custom': 'Personalizado',
          'send_only': 'Solo envío',
          'receive_only': 'Solo recepción',
          'send': 'Enviar',
          'receive': 'Recibir',
          'mandatory': 'Obligatorio',
          'required': 'Requerido',
          'not_possible': 'No es posible',
          'unknown': 'Desconocido',
          'automated': 'Automatizado',
          'automatic': 'Automático',
          'manual': 'Manual',
          'lsp_assisted': 'Asistido por LSP',
          'ios': 'iOS',
          'android': 'Android',
          'desktop': 'Escritorio',
          'web': 'Web',
          'lnd': 'LND',
          'ldk': 'LDK',
          'core_lightning': 'Core Lightning',
          'eclair': 'Eclair',
          'custodial': 'Custodial',
          'ln_node': 'Nodo LN',
          'liquid_swap': 'Intercambio Liquid',
          'on_chain_swap': 'Intercambio On-chain',
          'remote_node': 'Nodo Remoto',
          'chrome_extension': 'Extensión Chrome',
          'browser_extension': 'Extensión de Navegador',
          'web_(self-host)': 'Web (Auto-alojado)',
          'whatsapp': 'WhatsApp'
        }
      };
      
      // Normalize the value
      const normalizedVal = val.trim().toLowerCase().replace(/\s+/g, '_');
      
      // Return translation or capitalized original value
      const currentLang = language as 'en' | 'es';
      return translations[currentLang]?.[normalizedVal] || val.charAt(0).toUpperCase() + val.slice(1);
    };
    
    // Handle Channel Management feature which might have custom values
    if (featureName === 'Channel Management' || featureName === 'Channel / Peer Management' || 
        featureName === 'Gestión de Canales' || featureName === 'Gestión de Canales / Pares') {
      if (value === 'custom' && customText) {
        let displayText = customText;
        
        // Translate common channel management custom values
        if (customText === 'Automated') {
          displayText = language === 'es' ? 'Automatizado' : 'Automated';
        } else if (customText === 'LSP Assisted') {
          displayText = language === 'es' ? 'Asistido por LSP' : 'LSP Assisted';
        } else if (customText === 'Automatic') {
          displayText = language === 'es' ? 'Automático' : 'Automatic';
        } else if (customText === 'Manual') {
          displayText = language === 'es' ? 'Manual' : 'Manual';
        }
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-orange-100"
            title={displayText}
          >
            <span className="text-xs font-medium text-orange-600">
              {displayText}
            </span>
          </span>
        );
      }
    }
    
    // Handle platform feature specially (displays array values)
    if ((featureName?.toLowerCase() === 'platform' || featureName?.toLowerCase() === 'plataforma') && 
        value === 'custom' && customText) {
      const platforms = customText.split(',');
      return (
        <div className="flex flex-wrap gap-1 justify-center">
          {platforms.map((platform, index) => {
            // Translate platform values
            let displayPlatform = translateValue(platform.trim());
            
            // Icon mapping for platforms 
            let textColor = '';
            
            switch (platform.trim()) {
              case 'ios':
                textColor = 'text-blue-500';
                break;
              case 'android':
                textColor = 'text-green-600';
                break;
              case 'desktop':
                textColor = 'text-purple-600';
                break;
              case 'web':
                textColor = 'text-amber-600';
                break;
              default:
                textColor = 'text-gray-600';
            }
            
            return (
              <span 
                key={index}
                className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-primary/10"
                title={displayPlatform}
              >
                <span className={`text-xs font-medium ${textColor}`}>{displayPlatform}</span>
              </span>
            );
          })}
        </div>
      );
    }
    
    // Handle implementation value types with consistent styling
    if (['lnd', 'ldk', 'core_lightning', 'eclair'].includes(value)) {
      const displayValue = translateValue(value);
      
      return (
        <span 
          className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-blue-100 text-blue-600"
          title={displayValue}
        >
          <span className="text-xs font-medium">{displayValue}</span>
        </span>
      );
    }
    
    // Handle wallet category/types
    if (['custodial', 'ln_node', 'liquid_swap', 'on_chain_swap', 'remote_node'].includes(value)) {
      const displayValue = translateValue(value);
      
      return (
        <span 
          className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-purple-100 text-purple-600"
          title={displayValue}
        >
          <span className="text-xs font-medium">{displayValue}</span>
        </span>
      );
    }
    
    // Handle regular values with icons
    switch (value) {
      case 'yes':
        // Direct translation for yes
        const yesTitle = language === 'es' ? 'Característica completamente soportada' : 'Feature fully supported';
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20"
            title={yesTitle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'no':
      case 'not_possible':
        // Direct translation for no and not_possible
        const noTitle = value === 'not_possible' 
          ? (language === 'es' ? 'No es posible' : 'Not possible')
          : (language === 'es' ? 'Característica no soportada' : 'Feature not supported');
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive/20"
            title={noTitle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'partial':
      case 'optional':
        // Direct translation for partial and optional
        const titleText = value === 'partial' 
          ? (language === 'es' ? 'Parcial' : 'Partial')
          : (language === 'es' ? 'Opcional' : 'Optional');
        const displayLetter = value === 'partial' ? 'P' : 'O';
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-500/20"
            title={titleText}
          >
            <span className="text-xs font-medium text-orange-500">
              {displayLetter}
            </span>
          </span>
        );
      case 'custom':
        // Direct translation for custom
        const customDisplay = language === 'es' ? 'Personalizado' : 'Custom';
        const customTitle = customText || (language === 'es' ? 'Característica tiene implementación especial o limitaciones' : 'Feature has special implementation or limitations');
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-orange-100"
            title={customTitle}
          >
            <span className="text-xs font-medium text-orange-600">
              {customText || customDisplay}
            </span>
          </span>
        );
      case 'send_only':
        // Direct translation for send_only
        const sendOnlyTitle = language === 'es' ? 'Solo envío' : 'Send only';
        const sendDisplay = language === 'es' ? 'Enviar' : 'Send';
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-amber-100"
            title={sendOnlyTitle}
          >
            <span className="text-xs font-medium text-amber-600">
              {sendDisplay}
            </span>
          </span>
        );
      case 'receive_only':
        // Direct translation for receive_only
        const receiveOnlyTitle = language === 'es' ? 'Solo recepción' : 'Receive only';
        const receiveDisplay = language === 'es' ? 'Recibir' : 'Receive';
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-amber-100"
            title={receiveOnlyTitle}
          >
            <span className="text-xs font-medium text-amber-600">
              {receiveDisplay}
            </span>
          </span>
        );
      case 'mandatory':
        // Direct translation for mandatory
        const mandatoryTitle = language === 'es' ? 'Obligatorio' : 'Mandatory';
        const requiredDisplay = language === 'es' ? 'Requerido' : 'Required';
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-orange-100"
            title={mandatoryTitle}
          >
            <span className="text-xs font-medium text-orange-600">
              {requiredDisplay}
            </span>
          </span>
        );
      default:
        // Direct translation for unknown
        const unknownTitle = language === 'es' ? 'Desconocido' : 'Unknown';
        
        return (
          <span 
            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted"
            title={unknownTitle}
          >
            <span className="text-xs font-medium text-muted-foreground">?</span>
          </span>
        );
    }
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
