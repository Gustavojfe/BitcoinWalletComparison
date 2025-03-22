import { useState } from 'react';
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
import { WalletType } from '@/lib/types';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Wallet</DialogTitle>
          <DialogDescription>
            Enter the details for the new {walletType} wallet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="swapido-button">
              {isSubmitting ? 'Adding...' : 'Add Wallet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWalletModal;
