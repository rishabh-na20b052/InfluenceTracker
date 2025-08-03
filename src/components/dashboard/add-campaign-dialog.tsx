'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import type { Campaign } from '@/lib/types';

type AddCampaignDialogProps = {
  onAddCampaign: (campaign: Omit<Campaign, 'id' | 'postIds'>) => void;
};

export default function AddCampaignDialog({ onAddCampaign }: AddCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const handleSubmit = () => {
    if (!name || !description || !coverImageUrl) {
        // Here you might want to show an error to the user
        console.error("All fields are required");
        return;
    }
    onAddCampaign({ name, description, coverImageUrl });
    setOpen(false); // Close the dialog
    // Reset fields
    setName('');
    setDescription('');
    setCoverImageUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Campaign</DialogTitle>
          <DialogDescription>
            Fill in the details for your new campaign. Click create when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. 'Summer Kick-off'" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="A brief description of the campaign."/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coverImageUrl" className="text-right">
              Image URL
            </Label>
            <Input id="coverImageUrl" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="col-span-3" placeholder="https://placehold.co/600x300"/>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>Create Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}