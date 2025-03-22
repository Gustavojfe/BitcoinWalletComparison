import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import AddWalletModal from './AddWalletModal';
import AddFeatureModal from './AddFeatureModal';
import { WalletType } from '@/lib/types';

interface ControlPanelProps {
  walletType: WalletType;
  onSearch: (searchTerm: string) => void;
}

const ControlPanel = ({ walletType, onSearch }: ControlPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex space-x-4 mb-4 sm:mb-0">
          <button 
            onClick={() => setIsAddWalletModalOpen(true)}
            className="swapido-button inline-flex items-center px-3 py-2 text-sm leading-4 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Wallet
          </button>
          <button 
            onClick={() => setIsAddFeatureModalOpen(true)}
            className="swapido-button inline-flex items-center px-3 py-2 text-sm leading-4 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Feature
          </button>
        </div>
        <div className="flex space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={handleSearch}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary swapido-outline-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Add Wallet Modal */}
      <AddWalletModal 
        isOpen={isAddWalletModalOpen} 
        onClose={() => setIsAddWalletModalOpen(false)} 
        walletType={walletType}
      />

      {/* Add Feature Modal */}
      <AddFeatureModal 
        isOpen={isAddFeatureModalOpen} 
        onClose={() => setIsAddFeatureModalOpen(false)} 
        walletType={walletType}
      />
    </div>
  );
};

export default ControlPanel;
