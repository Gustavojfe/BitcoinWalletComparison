import { useState } from 'react';
import { WalletType } from '@/lib/types';
import HiddenWalletsModal from './HiddenWalletsModal';
import HiddenFeaturesModal from './HiddenFeaturesModal';
import { useVisibility } from '@/hooks/use-visibility-context';
import { useLanguage } from '@/hooks/use-language';
import { Eye, Search } from 'lucide-react';

interface ControlPanelProps {
  walletType: WalletType;
  onSearch: (searchTerm: string) => void;
}

const ControlPanel = ({ walletType, onSearch }: ControlPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isHiddenWalletsModalOpen, setIsHiddenWalletsModalOpen] = useState(false);
  const [isHiddenFeaturesModalOpen, setIsHiddenFeaturesModalOpen] = useState(false);
  const { t } = useLanguage();
  
  // Get visibility data to show counts
  const { getHiddenWallets, getHiddenFeatures } = useVisibility(walletType);
  const hiddenWalletCount = getHiddenWallets().length;
  const hiddenFeatureCount = getHiddenFeatures().length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="bg-card p-4 shadow rounded-lg mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex space-x-4 mb-4 sm:mb-0">
          <button 
            onClick={() => setIsHiddenWalletsModalOpen(true)}
            className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium border border-border rounded-md text-foreground bg-background hover:bg-accent focus:outline-none"
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('control.showHiddenWallets')}
            {hiddenWalletCount > 0 && (
              <span className="ml-1 bg-muted text-muted-foreground px-2 rounded-full text-xs">
                {hiddenWalletCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsHiddenFeaturesModalOpen(true)}
            className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium border border-border rounded-md text-foreground bg-background hover:bg-accent focus:outline-none"
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('control.showHiddenFeatures')}
            {hiddenFeatureCount > 0 && (
              <span className="ml-1 bg-muted text-muted-foreground px-2 rounded-full text-xs">
                {hiddenFeatureCount}
              </span>
            )}
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input 
            type="text" 
            placeholder={t('table.searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-input rounded-md bg-background text-foreground"
          />
        </div>
      </div>

      {/* Hidden Wallets Modal */}
      <HiddenWalletsModal 
        isOpen={isHiddenWalletsModalOpen} 
        onClose={() => setIsHiddenWalletsModalOpen(false)} 
        walletType={walletType}
      />

      {/* Hidden Features Modal */}
      <HiddenFeaturesModal 
        isOpen={isHiddenFeaturesModalOpen} 
        onClose={() => setIsHiddenFeaturesModalOpen(false)} 
        walletType={walletType}
      />
    </div>
  );
};

export default ControlPanel;
