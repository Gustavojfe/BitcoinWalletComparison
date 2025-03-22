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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Feature</DialogTitle>
          <DialogDescription>
            Enter the details for the new {walletType} wallet feature.
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Feature'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeatureModal;
