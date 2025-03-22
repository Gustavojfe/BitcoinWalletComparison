import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import WalletTooltip from './WalletTooltip';
import { WalletType, WalletWithFeatures, Feature } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ComparisonTableProps {
  walletType: WalletType;
  searchTerm: string;
}

const ComparisonTable = ({ walletType, searchTerm }: ComparisonTableProps) => {
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

  // Filter wallets based on search term
  const filteredWallets = walletsWithFeatures?.filter(wallet => 
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isWalletsLoading || isFeaturesLoading) {
    return <div className="bg-white shadow rounded-lg overflow-hidden p-6">
      <Skeleton className="h-96 w-full" />
    </div>;
  }

  if (!filteredWallets || !features) {
    return <div className="bg-white shadow rounded-lg overflow-hidden p-6">
      <p className="text-center text-gray-500">No data available</p>
    </div>;
  }

  if (filteredWallets.length === 0) {
    return <div className="bg-white shadow rounded-lg overflow-hidden p-6">
      <p className="text-center text-gray-500">No wallets match your search</p>
    </div>;
  }

  // Sort features by order
  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);
  
  // Sort wallets by order
  const sortedWallets = [...filteredWallets].sort((a, b) => a.order - b.order);

  // Render feature status based on value
  const renderFeatureStatus = (value: string, customText?: string) => {
    switch (value) {
      case 'yes':
        return (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'no':
        return (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100">
            <span className="text-xs font-medium text-amber-600">P</span>
          </span>
        );
      case 'custom':
        return (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100">
            <span className="text-xs font-medium text-amber-600">C</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
            <span className="text-xs font-medium text-gray-700">?</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="align-middle inline-block min-w-full">
          <div className="overflow-hidden border-b border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Wallet
                  </th>
                  {sortedFeatures.map((feature) => (
                    <th 
                      key={feature.id} 
                      scope="col" 
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]"
                    >
                      <WalletTooltip 
                        title={feature.name} 
                        description={feature.description}
                      >
                        {feature.name}
                      </WalletTooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedWallets.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:bg-gray-50">
                      <WalletTooltip 
                        title={wallet.name} 
                        description={wallet.description}
                      >
                        <a 
                          href={wallet.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-primary"
                        >
                          {wallet.name}
                        </a>
                      </WalletTooltip>
                    </td>
                    {sortedFeatures.map((feature) => {
                      const walletFeature = wallet.features.find(
                        (f) => f.featureId === feature.id
                      );
                      
                      return (
                        <td key={`${wallet.id}-${feature.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {walletFeature 
                            ? renderFeatureStatus(walletFeature.value, walletFeature.customText) 
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
