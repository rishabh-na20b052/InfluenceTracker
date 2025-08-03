import type { Post } from '@/lib/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Instagram,
  Youtube,
  Twitter,
  Heart,
  MessageCircle,
  Eye,
  Repeat,
} from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getImageWithFallback } from '@/lib/image-utils';


type PostCardProps = {
  post: Post;
};

const platformIcons = {
  Instagram: <Instagram className="h-5 w-5 text-pink-500" />,
  YouTube: <Youtube className="h-5 w-5 text-red-600" />,
  Twitter: <Twitter className="h-5 w-5 text-sky-500" />,
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function PostCard({ post }: PostCardProps) {
  const postDate = new Date(post.date);
  // To avoid hydration errors, we'll format the date in UTC.
  const zonedDate = toZonedTime(postDate, 'Etc/UTC');

  return (
    <Card className="overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {platformIcons[post.platform]}
          <CardTitle className="text-base font-semibold">{post.influencerHandle}</CardTitle>
        </div>
        <div className="text-xs text-muted-foreground">
          {format(zonedDate, 'dd MMM yyyy')}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <a href={post.url} target="_blank" rel="noopener noreferrer">
          <Image
            src={getImageWithFallback(post.thumbnailUrl, 'campaign')}
            alt={`Post by ${post.influencer}`}
            width={400}
            height={400}
            className="w-full object-cover aspect-square"
            data-ai-hint="influencer post"
          />
        </a>
      </CardContent>
      <CardFooter className="p-4 grid grid-cols-3 gap-2 text-sm mt-auto bg-card-foreground/5">
        <div className="flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="font-semibold">{formatNumber(post.engagement.likes)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 text-blue-500" />
          <span className="font-semibold">{formatNumber(post.engagement.comments)}</span>
        </div>
        {post.platform === 'Instagram' && post.engagement.views && (
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="font-semibold">{formatNumber(post.engagement.views)}</span>
          </div>
        )}
        {post.platform === 'YouTube' && post.engagement.views && (
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="font-semibold">{formatNumber(post.engagement.views)}</span>
          </div>
        )}
        {post.platform === 'Twitter' && post.engagement.retweets && (
          <div className="flex items-center gap-1.5">
            <Repeat className="h-4 w-4 text-green-500" />
            <span className="font-semibold">{formatNumber(post.engagement.retweets)}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
