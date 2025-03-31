import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { WalletWithFeatures, Feature } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';

const WalletComparisonResult = () => {
  const { wallet1: wallet1Id, wallet2: wallet2Id } = useParams();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();

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

  // Render feature status based on value
  const renderFeatureStatus = (value: string, customText?: string, featureName?: string) => {
    // Translate feature value using our translation system
    const translateValue = (val: string): string => {
      if (!val) return '';
      
      // Normalize the value for looking up in translations
      const normalizedVal = val.trim().toLowerCase().replace(/\s+/g, '_');
      
      // First try to find in features namespace
      let translated = t(`features.${normalizedVal}`);
      
      // If not found in features, try common namespace
      if (translated === `features.${normalizedVal}`) {
        translated = t(`common.${normalizedVal}`);
        
        // If still not found, use original with first letter capitalized
        if (translated === `common.${normalizedVal}`) {
          translated = val.charAt(0).toUpperCase() + val.slice(1);
        }
      }
      
      return translated;
    };
    
    // Handle platform feature specially (displays array values)
    if ((featureName?.toLowerCase() === 'platform' || featureName?.toLowerCase() === 'plataforma') && 
        value === 'custom' && customText) {
      const platforms = customText.split(',');
      return (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex flex-wrap gap-1">
            {platforms.map((platform, index) => {
              // Translate platform values
              const displayText = translateValue(platform.trim());
              
              return (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary"
                >
                  {displayText}
                </span>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Handle special value types with consistent styling (implementation types)
    if (['lnd', 'ldk', 'core_lightning', 'eclair'].includes(value)) {
      const displayValue = translateValue(value);
      
      return (
        <div className="flex items-center">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-600 mr-2">
            {value}
          </span>
          <span className="text-foreground">{displayValue}</span>
        </div>
      );
    }
    
    // Handle wallet types
    if (['custodial', 'ln_node', 'liquid_swap', 'on_chain_swap', 'remote_node'].includes(value)) {
      const displayValue = translateValue(value);
      
      return (
        <div className="flex items-center">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-600 mr-2">
            {value}
          </span>
          <span className="text-foreground">{displayValue}</span>
        </div>
      );
    }
    
    // Handle common channel management custom values
    if ((featureName === 'Channel Management' || featureName === 'Channel / Peer Management' || 
         featureName === 'Gestión de Canales' || featureName === 'Gestión de Canales / Pares') && 
        value === 'custom' && customText) {
      // Use hardcoded translations based on language
      let displayText = '';
      
      // Translate common channel management custom values
      if (customText === 'Automated') {
        displayText = language === 'es' ? 'Automatizado' : 'Automated';
      } else if (customText === 'LSP Assisted') {
        displayText = language === 'es' ? 'Asistido por LSP' : 'LSP Assisted';
      } else if (customText === 'Automatic') {
        displayText = language === 'es' ? 'Automático' : 'Automatic';
      } else if (customText === 'Manual') {
        displayText = language === 'es' ? 'Manual' : 'Manual';
      } else {
        displayText = customText;
      }
      
      // Use hardcoded translations based on language
      const customText2 = language === 'es' ? 'Personalizado' : 'Custom';
      
      return (
        <div className="flex items-center">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-orange-100 text-orange-600 mr-2">
            {displayText}
          </span>
          <span className="text-foreground">{customText2}</span>
        </div>
      );
    }
    
    // Handle regular values with icons
    switch (value) {
      case 'yes':
        // Use hardcoded translations based on language
        const yesText = language === 'es' ? 'Sí' : 'Yes';
        
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-foreground">{yesText}</span>
          </div>
        );
      case 'no':
      case 'not_possible':
        // Use hardcoded translations based on language
        const noText = 'No'; // Same in both languages
        const notPossibleText = language === 'es' ? 'No es posible' : 'Not Possible';
        const noDisplay = value === 'not_possible' ? notPossibleText : noText;
        
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive/20 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-foreground">{noDisplay}</span>
          </div>
        );
      case 'partial':
      case 'optional':
        // Use hardcoded translations based on language
        const partialText = language === 'es' ? 'Parcial' : 'Partial';
        const optionalText = language === 'es' ? 'Opcional' : 'Optional';
        const displayValue = value === 'partial' ? partialText : optionalText;
        const displayLetter = value === 'partial' ? 'P' : 'O';
        
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-500/20 mr-2">
              <span className="text-xs font-medium text-orange-500">
                {displayLetter}
              </span>
            </span>
            <span className="text-foreground">{displayValue}</span>
          </div>
        );
      case 'custom':
        // Use hardcoded translations based on language
        const customText = language === 'es' ? 'Personalizado' : 'Custom';
        
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-500/20 mr-2">
              <span className="text-xs font-medium text-orange-500">C</span>
            </span>
            <span className="text-foreground">{customText || customText}</span>
          </div>
        );
      case 'send_only':
        // Use hardcoded translations based on language
        const sendText = language === 'es' ? 'Enviar' : 'Send';
        const sendOnlyText = language === 'es' ? 'Solo envío' : 'Send Only';
        
        return (
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-600 mr-2">
              {sendText}
            </span>
            <span className="text-foreground">{sendOnlyText}</span>
          </div>
        );
      case 'receive_only':
        // Use hardcoded translations based on language
        const receiveText = language === 'es' ? 'Recibir' : 'Receive';
        const receiveOnlyText = language === 'es' ? 'Solo recepción' : 'Receive Only';
        
        return (
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-600 mr-2">
              {receiveText}
            </span>
            <span className="text-foreground">{receiveOnlyText}</span>
          </div>
        );
      case 'mandatory':
        // Use hardcoded translations based on language
        const requiredText = language === 'es' ? 'Requerido' : 'Required';
        const mandatoryText = language === 'es' ? 'Obligatorio' : 'Mandatory';
        
        return (
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-orange-100 text-orange-600 mr-2">
              {requiredText}
            </span>
            <span className="text-foreground">{mandatoryText}</span>
          </div>
        );
      default:
        // Use hardcoded translations based on language
        const unknownText = language === 'es' ? 'Desconocido' : 'Unknown';
        
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted mr-2">
              <span className="text-xs font-medium text-muted-foreground">?</span>
            </span>
            <span className="text-foreground">{unknownText}</span>
          </div>
        );
    }
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
                    ? renderFeatureStatus(wallet1Feature.value, wallet1Feature.customText, feature.name) 
                    : renderFeatureStatus('unknown')}
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  {wallet2Feature 
                    ? renderFeatureStatus(wallet2Feature.value, wallet2Feature.customText, feature.name) 
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