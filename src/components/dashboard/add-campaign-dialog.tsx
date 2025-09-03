// components/AddCampaignDialog.tsx (Updated)
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// This is a placeholder type. You should define it properly.
type Campaign = {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  user_id: string;
};

type AddCampaignDialogProps = {
  // Callback to refresh the campaign list in the parent component
  onCampaignAdded: (newCampaign: Campaign) => void;
};

export default function AddCampaignDialog({
  onCampaignAdded,
}: AddCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrlPreview, setCoverImageUrlPreview] = useState("");
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
        variant: "destructive",
        title: "Missing Fields",
        description:
          "Please provide a name and a description for the campaign.",
      });
      return;
    }

    setLoading(true);

    try {
      let finalCoverImageUrl = "/assets/campaign_dp1.webp";

      // Handle image upload if file is selected
      if (coverImageFile) {
        try {
          const formData = new FormData();
          formData.append("file", coverImageFile);

          const uploadResponse = await fetch("/api/storage/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            finalCoverImageUrl = uploadData.url;
          } else {
            toast({
              title: "Image Upload Failed",
              description: "Using default image instead.",
              variant: "destructive",
            });
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast({
            title: "Image Upload Failed",
            description: "Using default image instead.",
            variant: "destructive",
          });
        }
      }

      // Create campaign via API route
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          description: description,
          cover_image_url: finalCoverImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      toast({
        title: "Success!",
        description: `Campaign "${name}" has been created.`,
      });

      // Use the callback to update the UI in the parent component
      onCampaignAdded(data.campaign);

      // Reset form and close dialog
      setOpen(false);
      setName("");
      setDescription("");
      setCoverImageFile(null);
      setCoverImageUrlPreview("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: error.message || "Could not create the campaign.",
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
            Fill in the details for your new campaign. Click create when you're
            done.
          </DialogDescription>
        </DialogHeader>
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
              placeholder="e.g. 'Summer Kick-off'"
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
              placeholder="A brief description of the campaign."
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Cover</Label>
            <div className="col-span-3">
              <Input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
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
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
