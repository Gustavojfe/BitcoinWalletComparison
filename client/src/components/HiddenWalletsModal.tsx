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
import { useVisibility } from '@/hooks/use-visibility-context';
import { useLanguage } from '@/hooks/use-language';
import { Eye } from 'lucide-react';

interface HiddenWalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: WalletType;
}

const HiddenWalletsModal = ({ isOpen, onClose, walletType }: HiddenWalletsModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Get the visibility hook
  const { getHiddenWallets, toggleWalletVisibility } = useVisibility(walletType);
  const hiddenWalletIds = getHiddenWallets();
  
  // Fetch all wallets (always enabled)
  const { data: allWallets, isLoading: isWalletsLoading } = useQuery({
    queryKey: ['/api/wallets', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/wallets?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch wallets');
      return res.json() as Promise<Wallet[]>;
    }
  });

  // Filter to only show hidden wallets (recalculated every render)
  const hiddenWallets = allWallets?.filter(wallet => 
    hiddenWalletIds.includes(wallet.id)
  ) || [];

  // Handle showing a hidden wallet
  const handleShowWallet = (walletId: number) => {
    toggleWalletVisibility(walletId);
    
    // Invalidate all relevant queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    queryClient.invalidateQueries({ queryKey: ['/api/wallet-features'] });
    
    // Show success toast
    toast({
      title: t('hidden.walletUnhidden'),
      description: t('hidden.walletAddedBack')
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('control.showHiddenWallets')}</DialogTitle>
          <DialogDescription>
            {hiddenWalletIds.length === 0 
              ? t('hidden.notHiddenAnyWallets')
              : t('hidden.selectToShow')}
          </DialogDescription>
        </DialogHeader>

        {isWalletsLoading ? (
          <div className="text-center py-6">{t('table.loadingWallets')}</div>
        ) : hiddenWallets.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {t('hidden.noHiddenWallets')}
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
                  <span>{t('common.show')}</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('hidden.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HiddenWalletsModal;