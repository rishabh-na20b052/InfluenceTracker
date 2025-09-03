// components/DashboardClient.tsx (Final Version)
"use client";

import { useState, useMemo } from "react";
import type { Post, Platform } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import Header from "./header";
import CampaignSummary from "./campaign-summary";
import AddPostForm from "./add-post-form";
import FilterControls from "./filter-controls";
import PostGrid from "./post-grid";
import ShareCampaignDialog from "./share-campaign-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { getImageWithFallback } from "@/lib/image-utils";

type Filters = {
  platform: "all" | Platform;
  sortBy: keyof Post["engagement"] | "date";
  sortOrder: "asc" | "desc";
};

type DashboardClientProps = {
  initialPosts: Post[];
  campaignName: string;
  campaignId: string;
  isReadOnly: boolean;
};

export default function DashboardClient({
  initialPosts,
  campaignName,
  campaignId,
  isReadOnly,
}: DashboardClientProps) {
  // Defensive programming: ensure we have valid props
  if (!campaignName || !campaignId) {
    console.error("DashboardClient: Missing required props", {
      campaignName,
      campaignId,
    });
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Invalid Campaign Data</h1>
          <p className="text-muted-foreground">
            The campaign data is missing or invalid. Please try again.
          </p>
        </div>
      </div>
    );
  }
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filters, setFilters] = useState<Filters>({
    platform: "all",
    sortBy: "date",
    sortOrder: "desc",
  });
  const { toast } = useToast();

  const refreshPosts = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/posts`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: Failed to fetch posts`
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from server");
      }

      const mappedPosts: Post[] = (data.posts || []).map((p: any) => ({
        id: p.id,
        campaignId: p.campaign_id,
        url: p.post_url,
        platform:
          p.platform === "youtube"
            ? "YouTube"
            : p.platform === "instagram"
            ? "Instagram"
            : "Twitter",
        influencer: p.username || "Unknown",
        influencerHandle: p.username ? `@${p.username}` : "@unknown",
        thumbnailUrl: p.thumbnail_url || "/assets/campaign_dp1.webp",
        date: p.posted_at || p.created_at,
        engagement: {
          likes: Number(p.likes || 0),
          comments: Number(p.comments || 0),
          views: Number(p.views || 0),
          retweets: Number(p.shares || 0),
        },
      }));
      setPosts(mappedPosts);
    } catch (error) {
      console.error("Error refreshing posts:", error);
      toast({
        variant: "destructive",
        title: "Error Fetching Posts",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter((post) => {
        return filters.platform === "all" || post.platform === filters.platform;
      })
      .sort((a, b) => {
        let valA, valB;
        if (filters.sortBy === "date") {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        } else {
          valA = a.engagement[filters.sortBy as keyof typeof a.engagement] ?? 0;
          valB = b.engagement[filters.sortBy as keyof typeof b.engagement] ?? 0;
        }
        return filters.sortOrder === "asc" ? valA - valB : valB - valA;
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
                <AvatarImage
                  src={getImageWithFallback("/user.png", "admin")}
                  alt="@admin"
                />
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
            <ShareCampaignDialog
              campaignId={campaignId}
              campaignName={campaignName}
            />
          )}
        </div>

        {isReadOnly && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                This is a read-only view of the campaign's performance, shared
                by the administrator.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <CampaignSummary posts={filteredAndSortedPosts} />
        </div>

        <div
          className={`grid gap-8 ${
            isReadOnly ? "grid-cols-1" : "lg:grid-cols-3"
          }`}
        >
          <div className={isReadOnly ? "col-span-1" : "lg:col-span-2"}>
            <FilterControls filters={filters} setFilters={setFilters} />
            <PostGrid
              posts={filteredAndSortedPosts}
              onDeletePost={!isReadOnly ? handleDeletePost : undefined}
            />
          </div>
          {!isReadOnly && (
            <div className="lg:col-span-1">
              <AddPostForm campaignId={campaignId} onPostAdded={refreshPosts} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
