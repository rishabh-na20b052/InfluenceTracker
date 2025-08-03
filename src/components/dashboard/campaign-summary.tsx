'use client';

import { useState, useTransition } from 'react';
import type { Post } from '@/lib/types';
import { getCampaignSummary } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Users, Heart, MessageCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type CampaignSummaryProps = {
  posts: Post[];
};

export default function CampaignSummary({ posts }: CampaignSummaryProps) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState('');
  const { toast } = useToast();

  const totalPosts = posts.length;
  const { totalLikes, totalComments } = posts.reduce(
    (acc, post) => {
      acc.totalLikes += post.engagement.likes;
      acc.totalComments += post.engagement.comments;
      return acc;
    },
    { totalLikes: 0, totalComments: 0 }
  );
  
  const uniqueInfluencers = new Set(posts.map(p => p.influencer)).size;

  const handleGenerateSummary = () => {
    startTransition(async () => {
      const cumulativeEngagementStats = `Total Likes: ${totalLikes.toLocaleString()}, Total Comments: ${totalComments.toLocaleString()}`;
      
      const topPerformingPosts = posts
        .slice(0, 3) // Assuming posts are pre-sorted by performance
        .map(p => `${p.influencerHandle} on ${p.platform}: ${p.engagement.likes.toLocaleString()} likes`)
        .join('; ');

      const result = await getCampaignSummary({
        totalPostsTracked: totalPosts,
        cumulativeEngagementStats,
        topPerformingPosts,
      });

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setSummary('');
      } else {
        setSummary(result.summary);
      }
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">Campaign Snapshot</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">Tracked across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cumulative likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cumulative comments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Influencers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueInfluencers}</div>
            <p className="text-xs text-muted-foreground">Unique influencers in campaign</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center justify-between">
            <span>AI Performance Summary</span>
            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" defaultChecked />
              <Label htmlFor="auto-refresh" className="text-sm font-medium">Auto-Refresh</Label>
            </div>
          </CardTitle>
          <CardDescription>
            Generate an AI-powered summary of your campaign's performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center rounded-md border border-dashed p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : summary ? (
            <div className="text-sm prose max-w-none">{summary}</div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <p className="text-muted-foreground mb-4">Click the button to generate insights.</p>
              <Button onClick={handleGenerateSummary} disabled={isPending}>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Summary
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
