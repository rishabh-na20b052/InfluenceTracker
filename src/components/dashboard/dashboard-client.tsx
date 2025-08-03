'use client';

import { useState, useMemo } from 'react';
import type { Post, Platform } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import Header from './header';
import CampaignSummary from './campaign-summary';
import AddPostForm from './add-post-form';
import FilterControls from './filter-controls';
import PostGrid from './post-grid';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';

type Filters = {
  platform: 'all' | Platform;
  influencer: string;
  sortBy: keyof Post['engagement'] | 'date';
  sortOrder: 'asc' | 'desc';
};

type DashboardClientProps = {
  initialPosts: Post[];
  campaignName: string;
  campaignId: string;
  isReadOnly: boolean;
}

export default function DashboardClient({ initialPosts, campaignName, campaignId, isReadOnly }: DashboardClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filters, setFilters] = useState<Filters>({
    platform: 'all',
    influencer: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const { toast } = useToast();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/campaign/${campaignId}?view=readonly`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link Copied!',
      description: 'Read-only link copied to clipboard.',
    });
  };

  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter(post => {
        const platformMatch = filters.platform === 'all' || post.platform === filters.platform;
        const influencerMatch = post.influencer.toLowerCase().includes(filters.influencer.toLowerCase());
        return platformMatch && influencerMatch;
      })
      .sort((a, b) => {
        let valA, valB;

        if (filters.sortBy === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        } else {
          valA = a.engagement[filters.sortBy as keyof typeof a.engagement] ?? 0;
          valB = b.engagement[filters.sortBy as keyof typeof b.engagement] ?? 0;
        }

        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [posts, filters]);

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <main className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
           <div className="flex items-center gap-4">
            {isReadOnly ? (
               <Avatar className="h-10 w-10">
                  <AvatarImage src="/user.png" alt="@admin" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
            ) : (
              <Link href="/" passHref>
                <Button variant="outline" size="icon">
                  <ArrowLeft />
                </Button>
              </Link>
            )}
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              {campaignName}
            </h1>
          </div>
          {!isReadOnly && (
            <Button onClick={handleShare}>
              <Share2 className="mr-2"/>
              Share
            </Button>
          )}
        </div>
        
        {isReadOnly && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Experienced marketing professional dedicated to driving brand growth through strategic influencer collaborations.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
            <CampaignSummary posts={filteredAndSortedPosts} />
        </div>

        <div className={`grid gap-8 ${isReadOnly ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
          <div className={isReadOnly ? 'col-span-1' : 'lg:col-span-2'}>
            <FilterControls filters={filters} setFilters={setFilters} />
            <PostGrid posts={filteredAndSortedPosts} />
          </div>
          {!isReadOnly && (
            <div className="lg:col-span-1">
              <AddPostForm />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
