import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { WalletType, Feature } from '@/lib/types';
import { useVisibility } from '@/hooks/use-visibility';
import { Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: WalletType;
}

const AddFeatureModal = ({ isOpen, onClose, walletType }: AddFeatureModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("add-new");
  
  // Get the visibility hook
  const { getHiddenFeatures, toggleFeatureVisibility } = useVisibility(walletType);
  const hiddenFeatureIds = getHiddenFeatures();
  
  // Fetch feature data
  const { data: features, isLoading: isFeaturesLoading } = useQuery({
    queryKey: ['/api/features', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/features?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch features');
      return res.json() as Promise<Feature[]>;
    },
    enabled: isOpen && activeTab === "hidden" // Only fetch when tab is selected
  });
  
  // Get the hidden features
  const hiddenFeatures = features?.filter(feature => hiddenFeatureIds.includes(feature.id)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!name.trim() || !description.trim()) {
        throw new Error('All fields are required');
      }

      // Submit to API
      await apiRequest('POST', '/api/features', {
        name,
        description,
        type: walletType,
        order: 9999 // Default to end of list
      });

      // Show success toast
      toast({
        title: 'Success!',
        description: 'Feature has been added successfully.',
      });

      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/features'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-features'] });

      // Reset form and close modal
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add feature',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle showing a hidden feature
  const handleShowFeature = (featureId: number) => {
    toggleFeatureVisibility(featureId);
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
          <DialogTitle>{activeTab === "add-new" ? "Add New Feature" : "Manage Hidden Features"}</DialogTitle>
          <DialogDescription>
            {activeTab === "add-new" 
              ? `Enter the details for the new ${walletType} wallet feature.`
              : `Select hidden features to show them in the comparison table again.`
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-new">Add New Feature</TabsTrigger>
            <TabsTrigger value="hidden">
              Hidden Features
              {hiddenFeatureIds.length > 0 && (
                <span className="ml-1 bg-gray-200 text-gray-700 px-2 rounded-full text-xs">
                  {hiddenFeatureIds.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-new" className="pt-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="app-button">
                  {isSubmitting ? 'Adding...' : 'Add Feature'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="hidden" className="pt-4">
            {isFeaturesLoading ? (
              <div className="text-center py-6">Loading hidden features...</div>
            ) : hiddenFeatures.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No features are currently hidden.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeatureModal;
