'use client';

import { useState, useMemo } from 'react';
import type { Post, Platform } from '@/lib/types';
import { mockPosts } from '@/lib/data';

import Header from './header';
import CampaignSummary from './campaign-summary';
import AddPostForm from './add-post-form';
import FilterControls from './filter-controls';
import PostGrid from './post-grid';

type Filters = {
  platform: 'all' | Platform;
  influencer: string;
  sortBy: keyof Post['engagement'] | 'date';
  sortOrder: 'asc' | 'desc';
};

export default function DashboardClient() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filters, setFilters] = useState<Filters>({
    platform: 'all',
    influencer: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

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
    <div className="min-h-screen w-full">
      <Header />
      <main className="p-4 md:p-8">
        <CampaignSummary posts={filteredAndSortedPosts} />
        <div className="grid gap-8 lg:grid-cols-3 mt-8">
          <div className="lg:col-span-2">
            <FilterControls filters={filters} setFilters={setFilters} />
            <PostGrid posts={filteredAndSortedPosts} />
          </div>
          <div className="lg:col-span-1">
            <AddPostForm />
          </div>
        </div>
      </main>
    </div>
  );
}
