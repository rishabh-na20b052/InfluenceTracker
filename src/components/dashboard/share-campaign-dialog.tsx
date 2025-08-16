// components/share-campaign-dialog.tsx
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Share2, Copy, Check } from 'lucide-react';

type ShareCampaignDialogProps = {
  campaignId: string;
};

export default function ShareCampaignDialog({ campaignId }: ShareCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [ttlDays, setTtlDays] = useState(7); // Default to 7 days
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerateLink = async () => {
    if (!passcode) {
      toast({
        variant: 'destructive',
        title: 'Passcode Required',
        description: 'Please enter a passcode for the share link.',
      });
      return;
    }
    setLoading(true);

    try {
      const { data: accessToken, error } = await supabase.rpc('generate_campaign_access_link', {
        campaign_id_input: campaignId,
        passcode_input: passcode,
        ttl_hours: ttlDays * 24, // Convert days to hours
      });

      if (error) throw error;

      const shareUrl = `${window.location.origin}/view/${accessToken}`;
      setGeneratedLink(shareUrl);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Create Link',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `Link: ${generatedLink}\nPasscode: ${passcode}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };
  
  // Reset state when the dialog is closed
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setGeneratedLink('');
        setPasscode('');
        setTtlDays(7);
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Share2 className="mr-2" />
          Share Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Campaign</DialogTitle>
          <DialogDescription>
            Generate a secure, time-limited link with a passcode.
          </DialogDescription>
        </DialogHeader>
        
        {generatedLink ? (
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Share the following link and passcode with your client.
            </p>
            <div className="grid gap-2">
              <Label>Share Link</Label>
              <Input value={generatedLink} readOnly />
            </div>
            <div className="grid gap-2">
              <Label>Passcode</Label>
              <Input value={passcode} readOnly />
            </div>
            <Button onClick={handleCopy} className="w-full">
              {copied ? <Check className="mr-2"/> : <Copy className="mr-2" />}
              {copied ? 'Copied!' : 'Copy Link & Passcode'}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                  id="passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g., SECRET123"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ttl">Expires in (days)</Label>
                <Input
                  id="ttl"
                  type="number"
                  value={ttlDays}
                  onChange={(e) => setTtlDays(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleGenerateLink} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Secure Link'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}