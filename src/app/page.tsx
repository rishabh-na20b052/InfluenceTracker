import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/dashboard/header';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { campaigns } from '@/lib/data';

export default function CampaignsPage() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header />
      <main className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-headline">Campaigns</h1>
          <Button>
            <PlusCircle className="mr-2" />
            Add Campaign
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              <CardHeader className="p-0">
                <Image
                  src={campaign.coverImageUrl}
                  alt={`${campaign.name} cover`}
                  width={600}
                  height={300}
                  className="w-full h-40 object-cover"
                  data-ai-hint="campaign marketing"
                />
                <div className="p-6">
                  <CardTitle className="font-headline">{campaign.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6 pt-0">
                <p className="text-muted-foreground text-sm">
                  {campaign.postIds.length} posts tracked
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto">
                <Link href={`/campaign/${campaign.id}`} passHref>
                  <Button variant="outline" className="w-full">
                    View Dashboard <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
