// components/AddCampaignDialog.tsx (Updated)
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

// This is a placeholder type. You should define it properly.
type Campaign = {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  user_id:string;
};

type AddCampaignDialogProps = {
  // Callback to refresh the campaign list in the parent component
  onCampaignAdded: (newCampaign: Campaign) => void;
};

export default function AddCampaignDialog({ onCampaignAdded }: AddCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrlPreview, setCoverImageUrlPreview] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrlPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please provide a name and a description for the campaign.',
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a campaign.');
      }

      let finalCoverImageUrl = '';

      // 2. If a cover image is provided, upload it to Supabase Storage
      if (coverImageFile) {
        const filePath = `${user.id}/${Date.now()}-${coverImageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('campaign_covers')
          .upload(filePath, coverImageFile);

        if (uploadError) {
          throw uploadError;
        }

        // 3. Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('campaign_covers')
          .getPublicUrl(filePath);
        
        finalCoverImageUrl = publicUrl;
      }

      // 4. Insert the new campaign into the 'campaigns' table
      const { data: newCampaign, error: insertError } = await supabase
        .from('campaigns')
        .insert({
          name: name,
          description: description,
          user_id: user.id, // Associate campaign with the admin user
          cover_image_url: finalCoverImageUrl,
        })
        .select()
        .single(); // .select().single() returns the newly created row

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Success!',
        description: `Campaign "${name}" has been created.`,
      });

      // 5. Use the callback to update the UI in the parent component
      onCampaignAdded(newCampaign);
      
      // 6. Reset form and close dialog
      setOpen(false);
      setName('');
      setDescription('');
      setCoverImageFile(null);
      setCoverImageUrlPreview('');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Could not create the campaign.',
      });
    } finally {
      setLoading(false);
    }
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
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. 'Summer Kick-off'" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="A brief description of the campaign."/>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Cover</Label>
            <div className="col-span-3">
               <Input id="cover-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
               <Button asChild variant="outline">
                 <Label htmlFor="cover-image-upload" className="cursor-pointer">
                   <Upload className="mr-2" />
                   Upload Image
                 </Label>
               </Button>
               {coverImageUrlPreview && (
                <div className="mt-4">
                    <Image
                      src={coverImageUrlPreview}
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
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}