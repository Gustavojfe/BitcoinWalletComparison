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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
