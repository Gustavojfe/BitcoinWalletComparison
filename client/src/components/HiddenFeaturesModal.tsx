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
import { useVisibility } from '@/hooks/use-visibility';
import { Eye } from 'lucide-react';

interface HiddenFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: WalletType;
}

const HiddenFeaturesModal = ({ isOpen, onClose, walletType }: HiddenFeaturesModalProps) => {
  const { toast } = useToast();
  
  // Get the visibility hook
  const { getHiddenFeatures, toggleFeatureVisibility } = useVisibility(walletType);
  const hiddenFeatureIds = getHiddenFeatures();
  
  // Fetch all features to filter for hidden ones
  const { data: allFeatures, isLoading: isFeaturesLoading } = useQuery({
    queryKey: ['/api/features', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/features?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch features');
      return res.json() as Promise<Feature[]>;
    },
    enabled: isOpen // Only fetch when modal is open
  });

  // Filter to only show hidden features
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
      title: 'Feature unhidden',
      description: 'The feature has been added back to the comparison table.'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Hidden Features</DialogTitle>
          <DialogDescription>
            {hiddenFeatureIds.length === 0 
              ? "You haven't hidden any features yet." 
              : "Select hidden features to show them in the comparison table again."}
          </DialogDescription>
        </DialogHeader>

        {isFeaturesLoading ? (
          <div className="text-center py-6">Loading hidden features...</div>
        ) : hiddenFeatures.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No features are currently hidden.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto py-2">
            {hiddenFeatures.map(feature => (
              <div 
                key={feature.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
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

export default HiddenFeaturesModal;