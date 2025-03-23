import { WalletType } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';

interface TabSectionProps {
  activeTab: WalletType;
  onTabChange: (tab: WalletType) => void;
}

const TabSection = ({ activeTab, onTabChange }: TabSectionProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Wallet Types">
          <button 
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'lightning' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
            onClick={() => onTabChange('lightning')}
          >
            {t('common.lightning')}
          </button>
          <button 
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'onchain' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
            onClick={() => onTabChange('onchain')}
          >
            {t('common.onchain')}
          </button>
          <button 
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'hardware' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
            onClick={() => onTabChange('hardware')}
          >
            {t('common.hardware')}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TabSection;
