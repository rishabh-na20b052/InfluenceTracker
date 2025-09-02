
<<<<<<< HEAD
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import Header from '@/components/dashboard/header';
import { ArrowRight, Edit, Mail, MapPin, Calendar, Award, Share2 } from 'lucide-react';
import { campaigns as initialCampaigns } from '@/lib/data';
import type { Campaign } from '@/lib/types';
import AddCampaignDialog from '@/components/dashboard/add-campaign-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Separator } from '@/components/ui/separator';
import { getImageWithFallback } from '@/lib/image-utils';
import ThemeCreator from '@/components/theme-creator';
import { useToast } from '@/hooks/use-toast';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
=======
import { useEffect, useState } from "react";
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
import {
  ArrowRight,
  Edit,
  Mail,
  MapPin,
  Calendar,
  Award,
  Share2,
} from "lucide-react";
import type { Campaign } from "@/lib/types";
import AddCampaignDialog from "@/components/dashboard/add-campaign-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageWithFallback } from "@/lib/image-utils";
import ThemeCreator from "@/components/theme-creator";
import { useToast } from "@/hooks/use-toast";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignPostCounts, setCampaignPostCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
>>>>>>> fbb20c6 (Track Post and Share Campaign)
  const { toast } = useToast();
  
  // Check if we're in read-only mode
  const isReadOnly = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'readonly';

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}?view=readonly`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Profile Link Copied!',
      description: 'Read-only profile link copied to clipboard.',
    });
  };

<<<<<<< HEAD
  const handleAddCampaign = (newCampaign: Omit<Campaign, 'id' | 'postIds'>) => {
    const newCampaignWithId: Campaign = {
      ...newCampaign,
      id: `campaign-${Date.now()}`, // Simple unique ID generation
      postIds: [],
    };
    setCampaigns((prev) => [...prev, newCampaignWithId]);
=======
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/campaigns", { cache: "no-store" });
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddCampaign = async (
    newCampaign: Omit<Campaign, "id" | "postIds">
  ) => {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaign.name,
          description: newCampaign.description,
          cover_image_url: newCampaign.coverImageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create campaign");
      const c = data.campaign;
      const mapped: Campaign = {
        id: c.id,
        name: c.name,
        description: c.description || "",
        coverImageUrl:
          c.cover_image_url ||
          getImageWithFallback("/assets/campaign_dp1.webp", "campaign"),
        postIds: [],
      };
      setCampaigns((prev) => [mapped, ...prev]);
      setCampaignPostCounts((prev) => ({ ...prev, [mapped.id]: 0 })); // New campaign starts with 0 posts
      toast({ title: "Campaign created", description: mapped.name });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to create campaign",
        description: e?.message || "Unknown error",
      });
    }
>>>>>>> fbb20c6 (Track Post and Share Campaign)
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <main className="p-4 md:p-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Profile Image */}
            <div className="md:col-span-1 flex justify-center">
              <div className="relative">
                <Image
                  src={getImageWithFallback('/assets/man_do.jpg', 'admin')}
                  alt="Ujjwal Singh"
                  width={300}
                  height={300}
                  className="rounded-full object-cover w-64 h-64 border-4 border-primary/20 shadow-2xl"
                  priority
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-background">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-2">
                  Ujjwal Singh
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  Digital Marketing Specialist & Influencer Campaign Manager
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>ujjwal@influencetracker.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Mumbai, India</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>5+ years experience</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Experienced marketing professional dedicated to driving brand growth through strategic influencer collaborations. 
                  Specialized in campaign management, performance analytics, and building meaningful partnerships between brands and creators.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    <Award className="h-4 w-4" />
                    Campaign Strategy
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    <Award className="h-4 w-4" />
                    Influencer Relations
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    <Award className="h-4 w-4" />
                    Analytics & ROI
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {!isReadOnly && (
                    <>
                      <Link href="/profile" passHref>
                        <Button variant="outline" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      </Link>
                      <Button className="gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Me
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={handleShareProfile} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Campaigns Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-headline">Active Campaigns</h2>
            <p className="text-muted-foreground mt-2">
              Manage and track your influencer marketing campaigns
            </p>
          </div>
          {!isReadOnly && <AddCampaignDialog onAddCampaign={handleAddCampaign} />}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
<<<<<<< HEAD
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 overflow-hidden group">
              <CardHeader className="p-0 relative">
                <div className="overflow-hidden">
                    <Image
                      src={getImageWithFallback(campaign.coverImageUrl, 'campaign')}
                      alt={`${campaign.name} cover`}
                      width={600}
                      height={300}
                      className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                      data-ai-hint="campaign marketing"
                    />
                </div>
                <div className="p-6">
                  <CardTitle className="font-headline text-xl">{campaign.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6 pt-0">
                <p className="text-muted-foreground text-sm">
                  {campaign.postIds.length} posts tracked
                </p>
                <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{campaign.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-4 mt-auto bg-card/50">
                <Link href={`/campaign/${campaign.id}`} passHref className="w-full">
                  <Button variant="outline" className="w-full">
                    View Dashboard <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
=======
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
                      <CardTitle className="font-headline text-xl">
                        {campaign.name}
                      </CardTitle>
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
>>>>>>> fbb20c6 (Track Post and Share Campaign)
        </div>

        {!isReadOnly && (
          <>
            <Separator className="my-12" />

            {/* Appearance Section */}
            <Card className="p-8 bg-card/50">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold font-headline">Appearance</h2>
                    <p className="text-muted-foreground">Customize the look and feel of your dashboard.</p>
                </div>
                
                <div className="space-y-8">
                    {/* Quick Theme Switcher */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4">Quick Themes</h3>
                        <ThemeSwitcher />
                    </div>
                    
                    <Separator />
                    
                    {/* Custom Theme Creator */}
                    <ThemeCreator />
                </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
