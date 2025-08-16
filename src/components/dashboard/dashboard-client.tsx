// components/DashboardClient.tsx (Final Version)
'use client';

import { useState, useMemo } from 'react';
import type { Post, Platform } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
// CHANGE 1: Use the createClient function for client components
import { supabase } from '@/lib/supabaseClient';

import Header from './header';
import CampaignSummary from './campaign-summary';
import AddPostForm from './add-post-form';
import FilterControls from './filter-controls';
import PostGrid from './post-grid';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { getImageWithFallback } from '@/lib/image-utils';
// Import the new dialog component
import ShareCampaignDialog from './share-campaign-dialog';

type Filters = {
  platform: 'all' | Platform;
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
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const { toast } = useToast();

  const refreshPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('campaign_id', campaignId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Posts',
        description: error.message,
      });
    } else if (data) {
      setPosts(data as Post[]);
    }
  };

  // CHANGE 2: The entire handleShare function is now deleted.
  // Its logic is handled by the ShareCampaignDialog component.

  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter(post => {
        return filters.platform === 'all' || post.platform === filters.platform;
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
                  <AvatarImage src={getImageWithFallback('/user.png', 'admin')} alt="@admin" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
            ) : (
              <Link href="/dashboard" passHref>
                <Button variant="outline" size="icon">
                  <ArrowLeft />
                </Button>
              </Link>
            )}
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              {campaignName}
            </h1>
          </div>
          
          {/* CHANGE 3: Replace the old Button with the new Dialog component */}
          {!isReadOnly && (
            <ShareCampaignDialog campaignId={campaignId} />
          )}

        </div>
        
        {isReadOnly && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                This is a read-only view of the campaign's performance, shared by the administrator.
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
              <AddPostForm 
                campaignId={campaignId}
                onPostAdded={refreshPosts} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}