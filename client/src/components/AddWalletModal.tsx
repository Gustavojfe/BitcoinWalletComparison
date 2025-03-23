import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTabs,
  DialogTab,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { WalletType, Wallet } from '@/lib/types';
import { useVisibility } from '@/hooks/use-visibility';
import { Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: WalletType;
}

const AddWalletModal = ({ isOpen, onClose, walletType }: AddWalletModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("add-new");
  
  // Get the visibility hook
  const { getHiddenWallets, toggleWalletVisibility } = useVisibility(walletType);
  const hiddenWalletIds = getHiddenWallets();
  
  // Fetch wallet data
  const { data: wallets, isLoading: isWalletsLoading } = useQuery({
    queryKey: ['/api/wallets', { type: walletType }],
    queryFn: async () => {
      const res = await fetch(`/api/wallets?type=${walletType}`);
      if (!res.ok) throw new Error('Failed to fetch wallets');
      return res.json() as Promise<Wallet[]>;
    },
    enabled: isOpen && activeTab === "hidden" // Only fetch when tab is selected
  });
  
  // Get the hidden wallets
  const hiddenWallets = wallets?.filter(wallet => hiddenWalletIds.includes(wallet.id)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!name.trim() || !website.trim() || !description.trim()) {
        throw new Error('All fields are required');
      }

      // Validate URL
      try {
        new URL(website);
      } catch (error) {
        throw new Error('Please enter a valid URL');
      }

      // Submit to API
      await apiRequest('POST', '/api/wallets', {
        name,
        website,
        description,
        type: walletType,
        order: 9999 // Default to end of list
      });

      // Show success toast
      toast({
        title: 'Success!',
        description: 'Wallet has been added successfully.',
      });

      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-features'] });

      // Reset form and close modal
      setName('');
      setWebsite('');
      setDescription('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add wallet',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle showing a hidden wallet
  const handleShowWallet = (walletId: number) => {
    toggleWalletVisibility(walletId);
    queryClient.invalidateQueries({ queryKey: ['/api/wallet-features'] });
    
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
          <DialogTitle>{activeTab === "add-new" ? "Add New Wallet" : "Hidden Wallets"}</DialogTitle>
          <DialogDescription>
            {activeTab === "add-new" 
              ? `Enter the details for the new ${walletType} wallet.`
              : `Select hidden wallets to show them in the comparison table again.`
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-new">Add New Wallet</TabsTrigger>
            <TabsTrigger value="hidden">
              Hidden Wallets
              {hiddenWalletIds.length > 0 && (
                <span className="ml-1 bg-gray-200 text-gray-700 px-2 rounded-full text-xs">
                  {hiddenWalletIds.length}
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
                  <Label htmlFor="website" className="text-right">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="col-span-3"
                    placeholder="https://"
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
                  {isSubmitting ? 'Adding...' : 'Add Wallet'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="hidden" className="pt-4">
            {isWalletsLoading ? (
              <div className="text-center py-6">Loading hidden wallets...</div>
            ) : hiddenWallets.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No wallets are currently hidden.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddWalletModal;
