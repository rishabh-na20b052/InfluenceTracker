
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import Header from '@/components/dashboard/header';
import { ArrowRight, Edit } from 'lucide-react';
import { campaigns as initialCampaigns } from '@/lib/data';
import type { Campaign } from '@/lib/types';
import AddCampaignDialog from '@/components/dashboard/add-campaign-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Separator } from '@/components/ui/separator';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  const handleAddCampaign = (newCampaign: Omit<Campaign, 'id' | 'postIds'>) => {
    const newCampaignWithId: Campaign = {
      ...newCampaign,
      id: `campaign-${Date.now()}`, // Simple unique ID generation
      postIds: [],
    };
    setCampaigns((prev) => [...prev, newCampaignWithId]);
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <main className="p-4 md:p-8">

        <Card className="mb-8 overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-primary shadow-md">
                        <AvatarImage src="https://placehold.co/100x100" alt="@admin" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="font-headline text-2xl tracking-tight">Admin User</CardTitle>
                        <CardDescription className="mt-2 text-base max-w-prose">
                        Experienced marketing professional dedicated to driving brand growth through strategic influencer collaborations.
                        </CardDescription>
                    </div>
                </div>
                <Link href="/profile" passHref>
                    <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Profile</span>
                    </Button>
                </Link>
            </CardHeader>
        </Card>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-headline">Campaigns</h1>
          <AddCampaignDialog onAddCampaign={handleAddCampaign} />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 overflow-hidden group">
              <CardHeader className="p-0 relative">
                <div className="overflow-hidden">
                    <Image
                      src={campaign.coverImageUrl}
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
        </div>

        <Separator className="my-12" />

        <Card className="flex flex-col items-center gap-4 p-8 bg-card/50">
            <h2 className="text-2xl font-bold font-headline">Appearance</h2>
            <p className="text-muted-foreground">Customize the look and feel of your dashboard.</p>
            <ThemeSwitcher />
        </Card>
      </main>
    </div>
  );
}
