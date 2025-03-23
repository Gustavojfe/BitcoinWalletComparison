import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { WalletType, Wallet } from '@/lib/types';
import { useVisibility } from '@/hooks/use-visibility';
import { Eye } from 'lucide-react';

interface HiddenWalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: WalletType;
}

const HiddenWalletsModal = ({ isOpen, onClose, walletType }: HiddenWalletsModalProps) => {
  const { toast } = useToast();
  
  // Get the visibility hook
  const { getHiddenWallets, toggleWalletVisibility } = useVisibility(walletType);
  const hiddenWalletIds = getHiddenWallets();
  
  // Fetch all wallets to filter for hidden ones
  const { data: allWallets, isLoading: isWalletsLoading } = useQuery({
    queryKey: ['/api/wallets', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/wallets?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch wallets');
      return res.json() as Promise<Wallet[]>;
    },
    enabled: isOpen // Only fetch when modal is open
  });

  // Filter to only show hidden wallets
  const hiddenWallets = allWallets?.filter(wallet => 
    hiddenWalletIds.includes(wallet.id)
  ) || [];

  // Handle showing a hidden wallet
  const handleShowWallet = (walletId: number) => {
    toggleWalletVisibility(walletId);
    queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    
    // Show success toast
    toast({
      title: 'Wallet unhidden',
      description: 'The wallet has been added back to the comparison table.'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Hidden Wallets</DialogTitle>
          <DialogDescription>
            {hiddenWalletIds.length === 0 
              ? "You haven't hidden any wallets yet." 
              : "Select hidden wallets to show them in the comparison table again."}
          </DialogDescription>
        </DialogHeader>

        {isWalletsLoading ? (
          <div className="text-center py-6">Loading hidden wallets...</div>
        ) : hiddenWallets.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No wallets are currently hidden.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto py-2">
            {hiddenWallets.map(wallet => (
              <div 
                key={wallet.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {wallet.description.length > 60 
                      ? wallet.description.substring(0, 60) + '...' 
                      : wallet.description
                    }
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShowWallet(wallet.id)}
                  className="flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span>Show</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HiddenWalletsModal;