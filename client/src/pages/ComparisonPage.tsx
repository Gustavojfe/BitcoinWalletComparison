import { useState } from 'react';
import { WalletType } from '@/lib/types';
import TabSection from '@/components/TabSection';
import ControlPanel from '@/components/ControlPanel';
import ComparisonTable from '@/components/ComparisonTable';
import ComparisonWizard from '@/components/ComparisonWizard';

const ComparisonPage = () => {
  const [activeTab, setActiveTab] = useState<WalletType>('lightning');
  const [searchTerm, setSearchTerm] = useState('');

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
          <div className="bg-white shadow rounded-lg p-12 text-center my-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              {activeTab === 'onchain' ? 'On-Chain' : 'Hardware'} wallet comparisons are currently in development.
            </p>
            <p className="text-md text-gray-500">
              We're working hard to bring you detailed comparisons of {activeTab === 'onchain' ? 'On-Chain' : 'Hardware'} Bitcoin wallets.
              Check back soon for updates or explore our Lightning wallet comparisons in the meantime.
            </p>
          </div>
        )}
        
        {/* Help Section */}
        <div id="help-section" className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Help</h2>
          <div className="prose prose-sm text-gray-500">
            <p>
              This comparison page allows you to compare the features of different {activeTab} Bitcoin wallets.
            </p>
            <ul>
              <li>Hover over wallet names or feature titles to see detailed descriptions.</li>
              <li>Click on wallet names to visit their official websites.</li>
              <li>Use the search box to filter wallets by name or description.</li>
              <li>Select two wallets in the comparison wizard to see a side-by-side comparison.</li>
              <li>Use the "Add Wallet" or "Add Feature" buttons to contribute to this comparison.</li>
            </ul>
            <p>
              <strong>Legend:</strong>
            </p>
            <ul>
              <li>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Feature is fully supported</span>
              </li>
              <li>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Feature is not supported</span>
              </li>
              <li>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 mr-1">
                  <span className="text-xs font-medium text-amber-700">P</span>
                </span>
                <span>Feature is partially supported</span>
              </li>
              <li>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 mr-1">
                  <span className="text-xs font-medium text-amber-700">...</span>
                </span>
                <span>Feature has special implementation or limitations (hover to see details)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
