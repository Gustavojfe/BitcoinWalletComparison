import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { WalletWithFeatures, Feature } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const WalletComparisonResult = () => {
  const { wallet1: wallet1Id, wallet2: wallet2Id } = useParams();
  const [, navigate] = useLocation();

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
        <div className="bg-white p-6 shadow rounded-lg">
          <h1 className="text-xl font-bold mb-4">Wallet Comparison</h1>
          <p className="text-gray-500 mb-4">Unable to find the selected wallets or features.</p>
          <Button onClick={() => navigate('/')} className="swapido-button">Return to Comparison Page</Button>
        </div>
      </div>
    );
  }

  // Sort features by order
  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);

  // Render feature status based on value
  const renderFeatureStatus = (value: string, customText?: string) => {
    switch (value) {
      case 'yes':
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span>Yes</span>
          </div>
        );
      case 'no':
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <span>No</span>
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 mr-2">
              <span className="text-xs font-medium text-amber-600">P</span>
            </span>
            <span>Partial</span>
          </div>
        );
      case 'custom':
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 mr-2">
              <span className="text-xs font-medium text-amber-600">C</span>
            </span>
            <span>{customText || 'Custom'}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 mr-2">
              <span className="text-xs font-medium text-gray-700">?</span>
            </span>
            <span>Unknown</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="bg-white p-6 shadow rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-xl font-bold mb-2 sm:mb-0">Wallet Comparison</h1>
          <Button onClick={() => navigate('/')} className="swapido-button">Return to Comparison Page</Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-1">
            <h2 className="font-medium text-gray-800">Feature</h2>
          </div>
          <div className="col-span-1">
            <h2 className="font-medium text-gray-800 text-center">
              <a href={wallet1.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                {wallet1.name}
              </a>
            </h2>
          </div>
          <div className="col-span-1">
            <h2 className="font-medium text-gray-800 text-center">
              <a href={wallet2.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                {wallet2.name}
              </a>
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedFeatures.map(feature => {
            const wallet1Feature = wallet1.features.find(f => f.featureId === feature.id);
            const wallet2Feature = wallet2.features.find(f => f.featureId === feature.id);

            return (
              <div key={feature.id} className="grid grid-cols-3 gap-4 py-4">
                <div className="col-span-1">
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-gray-500">{feature.description}</div>
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  {wallet1Feature 
                    ? renderFeatureStatus(wallet1Feature.value, wallet1Feature.customText) 
                    : renderFeatureStatus('unknown')}
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  {wallet2Feature 
                    ? renderFeatureStatus(wallet2Feature.value, wallet2Feature.customText) 
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
