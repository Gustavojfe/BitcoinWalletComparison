import { useState } from 'react';
import { WalletType } from '@/lib/types';
import TabSection from '@/components/TabSection';
import ControlPanel from '@/components/ControlPanel';
import ComparisonTable from '@/components/ComparisonTable';
import ComparisonWizard from '@/components/ComparisonWizard';
import { useLanguage } from '@/hooks/use-language';

const ComparisonPage = () => {
  const [activeTab, setActiveTab] = useState<WalletType>('lightning');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  const handleTabChange = (tab: WalletType) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div>
      <TabSection activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {activeTab === 'lightning' ? (
          <>
            <ControlPanel walletType={activeTab} onSearch={handleSearch} />
            
            {/* Main comparison table */}
            <ComparisonTable walletType={activeTab} searchTerm={searchTerm} />
            
            {/* Wallet comparison wizard */}
            <ComparisonWizard walletType={activeTab} />
          </>
        ) : (
          <div className="bg-card text-card-foreground shadow rounded-lg p-12 text-center my-12">
            <h2 className="text-2xl font-bold mb-4">{t('comingSoon.title')}</h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t('comingSoon.inDevelopment').replace('{type}', t(`common.${activeTab}`))}
            </p>
            <p className="text-md text-muted-foreground">
              {t('comingSoon.workingHard').replace('{type}', t(`common.${activeTab}`))}
              {' '}
              {t('comingSoon.checkBack')}
            </p>
          </div>
        )}
        
        {/* Help Section */}
        <div id="help-section" className="mt-8 bg-card text-card-foreground shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">{t('common.help')}</h2>
          <div className="prose prose-sm dark:prose-invert">
            <p>
              {t('help.description').replace('{type}', t(`common.${activeTab}`))}
            </p>
            <ul>
              <li>{t('help.hoverTip')}</li>
              <li>{t('help.clickTip')}</li>
              <li>{t('help.searchTip')}</li>
              <li>{t('help.wizardTip')}</li>
              <li>{t('help.contributeTip')}</li>
            </ul>
            <p>
              <strong>{t('help.legend')}:</strong>
            </p>
            <ul>
              <li>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>{t('help.supportedFull')}</span>
              </li>
              <li>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>{t('help.supportedNone')}</span>
              </li>
              <li>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 mr-1">
                  <span className="text-xs font-medium text-amber-700">P</span>
                </span>
                <span>{t('help.supportedPartial')}</span>
              </li>
              <li>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 mr-1">
                  <span className="text-xs font-medium text-amber-700">...</span>
                </span>
                <span>{t('help.supportedCustom')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
