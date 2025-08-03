'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { PlusCircle, Upload } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type AddCampaignDialogProps = {
  onAddCampaign: (campaign: Omit<Campaign, 'id' | 'postIds'>) => void;
};

export default function AddCampaignDialog({ onAddCampaign }: AddCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name || !description || !coverImageUrl) {
        toast({
          variant: 'destructive',
          title: 'Missing Fields',
          description: 'Please fill out all fields, including the cover image.',
        });
        return;
    }
    onAddCampaign({ name, description, coverImageUrl });
    setOpen(false); // Close the dialog
    // Reset fields
    setName('');
    setDescription('');
    setCoverImageUrl('');
    setCoverImageFile(null);
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
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Cover
            </Label>
            <div className="col-span-3">
               <Input id="cover-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
               <Button asChild variant="outline">
                 <Label htmlFor="cover-image-upload" className="cursor-pointer">
                   <Upload className="mr-2" />
                   Upload Image
                 </Label>
               </Button>
               {coverImageUrl && (
                <div className="mt-4">
                    <Image
                      src={coverImageUrl}
                      alt="Cover image preview"
                      width={200}
                      height={100}
                      className="rounded-md object-cover w-full h-32"
                    />
                </div>
               )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>Create Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
