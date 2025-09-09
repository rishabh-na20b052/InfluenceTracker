"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import Header from "@/components/dashboard/header";
import { ArrowRight, Trash2 } from "lucide-react";
import type { Campaign } from "@/lib/types";
import AddCampaignDialog from "@/components/dashboard/add-campaign-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageWithFallback } from "@/lib/image-utils";
import ThemeCreator from "@/components/theme-creator";
import { useToast } from "@/hooks/use-toast";
import ProfileSection from "@/components/dashboard/profile-section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/auth-context";

function CampaignsPageContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignPostCounts, setCampaignPostCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Try to get auth context, but handle the case where it might not be available (shared links)
  let user = null;
  let authLoading = false;
  try {
    const auth = useAuth();
    user = auth.user;
    authLoading = auth.loading;
  } catch (error) {
    // Auth context not available (e.g., for shared links)
    user = null;
    authLoading = false;
  }

  // Check if we're in read-only mode
  const isReadOnly =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "readonly";

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}?view=readonly`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Profile Link Copied!",
      description: "Read-only profile link copied to clipboard.",
    });
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load campaigns");
      const mapped: Campaign[] = (data.campaigns || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
        coverImageUrl:
          c.cover_image_url ||
          getImageWithFallback("/assets/campaign_dp1.webp", "campaign"),
        postIds: [], // Keep empty for compatibility
      }));

      // Store post counts separately
      const counts: Record<string, number> = {};
      (data.campaigns || []).forEach((c: any) => {
        counts[c.id] = c.posts?.[0]?.count || 0;
      });

      setCampaigns(mapped);
      setCampaignPostCounts(counts);

      // Cache the fresh data
      try {
        localStorage.setItem("campaigns", JSON.stringify(mapped));
        localStorage.setItem("campaignPostCounts", JSON.stringify(counts));
      } catch (error) {
        console.warn("Failed to cache data:", error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    // Try to load cached data first for faster initial render
    const loadCachedData = () => {
      try {
        const cachedCampaigns = localStorage.getItem("campaigns");
        const cachedCounts = localStorage.getItem("campaignPostCounts");

        if (cachedCampaigns) {
          setCampaigns(JSON.parse(cachedCampaigns));
        }
        if (cachedCounts) {
          setCampaignPostCounts(JSON.parse(cachedCounts));
        }
      } catch (error) {
        console.warn("Failed to load cached data:", error);
      }
    };

    // Load cached data immediately
    loadCachedData();

    // Then fetch fresh data
    fetchCampaigns();
  }, [authLoading]);

  // Note: Removed visibility change listener to prevent navigation issues
  // The localStorage caching provides sufficient state persistence

  const handleAddCampaign = (newCampaign: {
    id: string;
    name: string;
    description: string;
    cover_image_url: string;
    user_id: string;
  }) => {
    // The campaign was already created by the dialog, just update the UI
    const mapped: Campaign = {
      id: newCampaign.id,
      name: newCampaign.name,
      description: newCampaign.description || "",
      coverImageUrl:
        newCampaign.cover_image_url ||
        getImageWithFallback("/assets/campaign_dp1.webp", "campaign"),
      postIds: [],
    };

    setCampaigns((prev) => [mapped, ...prev]);
    setCampaignPostCounts((prev) => ({ ...prev, [mapped.id]: 0 })); // New campaign starts with 0 posts

    // Update cache
    try {
      const updatedCampaigns = [mapped, ...campaigns];
      const updatedCounts = { ...campaignPostCounts, [mapped.id]: 0 };
      localStorage.setItem("campaigns", JSON.stringify(updatedCampaigns));
      localStorage.setItem("campaignPostCounts", JSON.stringify(updatedCounts));
    } catch (error) {
      console.warn("Failed to update cache:", error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedCampaigns = campaigns.filter(
          (campaign) => campaign.id !== campaignId
        );
        const updatedCounts = { ...campaignPostCounts };
        delete updatedCounts[campaignId];

        setCampaigns(updatedCampaigns);
        setCampaignPostCounts(updatedCounts);

        // Update cache
        try {
          localStorage.setItem("campaigns", JSON.stringify(updatedCampaigns));
          localStorage.setItem(
            "campaignPostCounts",
            JSON.stringify(updatedCounts)
          );
        } catch (error) {
          console.warn("Failed to update cache:", error);
        }

        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user && !isReadOnly) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to access your dashboard.
          </p>
          <a href="/auth/login">
            <Button>Go to Login</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <main className="p-4 md:p-8">
        {/* Hero Section */}
        <ProfileSection isReadOnly={isReadOnly} />

        <Separator className="my-12" />

        {/* Campaigns Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-headline">
              Active Campaigns
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage and track your influencer marketing campaigns
            </p>
          </div>
          {!isReadOnly && (
            <AddCampaignDialog onCampaignAdded={handleAddCampaign} />
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={`loading-${i}`}
                  className="flex flex-col overflow-hidden"
                >
                  <CardHeader className="p-0">
                    <Skeleton className="w-full h-48" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-6 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="p-6 pt-4 mt-auto">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))
            : // Actual campaigns
              campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 overflow-hidden group"
                >
                  <CardHeader className="p-0 relative">
                    <div className="overflow-hidden">
                      <Image
                        src={getImageWithFallback(
                          campaign.coverImageUrl,
                          "campaign"
                        )}
                        alt={`${campaign.name} cover`}
                        width={600}
                        height={300}
                        className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        data-ai-hint="campaign marketing"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-headline text-xl">
                          {campaign.name}
                        </CardTitle>
                        {!isReadOnly && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Campaign
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {campaign.name}"? This will also delete all
                                  associated posts. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCampaign(campaign.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-6 pt-0">
                    <p className="text-muted-foreground text-sm">
                      {campaignPostCounts[campaign.id] || 0} posts tracked
                    </p>
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                      {campaign.description}
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-4 mt-auto bg-card/50">
                    <Link
                      href={`/campaign/${campaign.id}`}
                      passHref
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        View Dashboard{" "}
                        <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
        </div>

        {/* Appearance Section - Commented out for now
        {!isReadOnly && (
          <>
            <Separator className="my-12" />

            <Card className="p-8 bg-card/50">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-headline">Appearance</h2>
                <p className="text-muted-foreground">
                  Customize the look and feel of your dashboard.
                </p>
              </div>

              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Quick Themes</h3>
                  <ThemeSwitcher />
                </div>

                <Separator />

                <ThemeCreator />
              </div>
            </Card>
          </>
        )}
        */}
      </main>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-background">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          </div>
        </div>
      }
    >
      <CampaignsPageContent />
    </Suspense>
  );
}
