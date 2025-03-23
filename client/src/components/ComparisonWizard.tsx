import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { WalletType, Wallet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ComparisonWizardProps {
  walletType: WalletType;
}

const ComparisonWizard = ({ walletType }: ComparisonWizardProps) => {
  const [wallet1, setWallet1] = useState<string>('');
  const [wallet2, setWallet2] = useState<string>('');
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch wallets
  const { data: wallets, isLoading } = useQuery({
    queryKey: ['/api/wallets', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/wallets?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch wallets');
      return res.json() as Promise<Wallet[]>;
    }
  });

  // Handle compare button click
  const handleCompare = () => {
    if (!wallet1 || !wallet2) {
      toast({
        title: 'Selection Required',
        description: 'Please select two wallets to compare.',
        variant: 'destructive',
      });
      return;
    }

    if (wallet1 === wallet2) {
      toast({
        title: 'Invalid Selection',
        description: 'Please select two different wallets to compare.',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to comparison page
    navigate(`/compare/${wallet1}/${wallet2}`);
  };

  // Sort wallets alphabetically
  const sortedWallets = wallets 
    ? [...wallets].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <div className="mt-8 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Wallet Comparison</h2>
      <p className="text-sm text-gray-500 mb-4">Select two wallets to compare their features side by side</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="wallet1" className="block text-sm font-medium text-gray-700">First Wallet</label>
          <Select 
            value={wallet1} 
            onValueChange={setWallet1}
            disabled={isLoading}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select a wallet..." />
            </SelectTrigger>
            <SelectContent>
              {sortedWallets.map(wallet => (
                <SelectItem key={wallet.id} value={wallet.id.toString()}>
                  {wallet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="wallet2" className="block text-sm font-medium text-gray-700">Second Wallet</label>
          <Select 
            value={wallet2} 
            onValueChange={setWallet2}
            disabled={isLoading}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select a wallet..." />
            </SelectTrigger>
            <SelectContent>
              {sortedWallets.map(wallet => (
                <SelectItem key={wallet.id} value={wallet.id.toString()}>
                  {wallet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={handleCompare}
          disabled={isLoading || !wallet1 || !wallet2}
          className="app-button inline-flex items-center px-4 py-2 text-sm font-medium shadow-sm"
        >
          Compare Wallets
        </Button>
      </div>
    </div>
  );
};

export default ComparisonWizard;
