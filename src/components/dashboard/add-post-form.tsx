// components/AddPostForm.tsx (Updated)
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

type AddPostFormProps = {
  campaignId: string; // The campaign to add the post to
  onPostAdded: () => void; // Callback to refresh the post list
};

// A simple helper to determine the platform from the URL
const getPlatformFromUrl = (url: string): 'instagram' | 'youtube' | 'x' | null => {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'x';
  return null;
};

export default function AddPostForm({ campaignId, onPostAdded }: AddPostFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const platform = getPlatformFromUrl(url);

    if (!platform) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Platform',
        description: 'Please submit a valid URL from Instagram, YouTube, or X/Twitter.',
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('posts').insert({
        campaign_id: campaignId,
        post_url: url,
        platform: platform,
      });

      if (error) {
        // RLS will prevent insertion if the user doesn't own the campaign.
        // The error might be a unique constraint violation if the post is already added.
        throw error;
      }

      toast({
        title: 'Post Added!',
        description: 'The new post is now being tracked.',
      });
      onPostAdded(); // Trigger refresh in parent
      setUrl(''); // Reset form
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Add Post',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Track New Post</CardTitle>
        <CardDescription>
          Submit a post URL from Instagram, YouTube, or X.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="post-url">Post URL</Label>
            <Input
              id="post-url"
              name="post-url"
              placeholder="https://platform.com/post/..."
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Tracking...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Track Post</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}