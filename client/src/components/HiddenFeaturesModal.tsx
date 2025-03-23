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
import { WalletType, Feature } from '@/lib/types';
import { useVisibility } from '@/hooks/use-visibility-context';
import { useLanguage } from '@/hooks/use-language';
import { Eye } from 'lucide-react';

interface HiddenFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: WalletType;
}

const HiddenFeaturesModal = ({ isOpen, onClose, walletType }: HiddenFeaturesModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Get the visibility hook
  const { getHiddenFeatures, toggleFeatureVisibility } = useVisibility(walletType);
  const hiddenFeatureIds = getHiddenFeatures();
  
  // Fetch all features (always enabled)
  const { data: allFeatures, isLoading: isFeaturesLoading } = useQuery({
    queryKey: ['/api/features', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/features?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch features');
      return res.json() as Promise<Feature[]>;
    }
  });

  // Filter to only show hidden features (recalculated every render)
  const hiddenFeatures = allFeatures?.filter(feature => 
    hiddenFeatureIds.includes(feature.id)
  ) || [];

  // Handle showing a hidden feature
  const handleShowFeature = (featureId: number) => {
    toggleFeatureVisibility(featureId);
    
    // Invalidate all relevant queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['/api/features'] });
    queryClient.invalidateQueries({ queryKey: ['/api/wallet-features'] });
    
    // Show success toast
    toast({
      title: t('hidden.featureUnhidden'),
      description: t('hidden.featureAddedBack')
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('control.showHiddenFeatures')}</DialogTitle>
          <DialogDescription>
            {hiddenFeatureIds.length === 0 
              ? t('hidden.notHiddenAnyFeatures')
              : t('hidden.selectToShow')}
          </DialogDescription>
        </DialogHeader>

        {isFeaturesLoading ? (
          <div className="text-center py-6">{t('table.loadingFeatures')}</div>
        ) : hiddenFeatures.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {t('hidden.noHiddenFeatures')}
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto py-2">
            {hiddenFeatures.map(feature => (
              <div 
                key={feature.id} 
                className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-accent"
              >
                <div>
                  <div className="font-medium text-foreground">{feature.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {feature.description.length > 60 
                      ? feature.description.substring(0, 60) + '...' 
                      : feature.description
                    }
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShowFeature(feature.id)}
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

export default HiddenFeaturesModal;