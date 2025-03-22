import { useState } from 'react';
import { WalletType } from '@/lib/types';

interface TabSectionProps {
  activeTab: WalletType;
  onTabChange: (tab: WalletType) => void;
}

const TabSection = ({ activeTab, onTabChange }: TabSectionProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Wallet Types">
          <button 
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'lightning' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => onTabChange('lightning')}
          >
            Lightning
          </button>
          <button 
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'onchain' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => onTabChange('onchain')}
          >
            On-Chain
          </button>
          <button 
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'hardware' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => onTabChange('hardware')}
          >
            Hardware
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TabSection;
