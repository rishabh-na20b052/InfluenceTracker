export type Platform = 'Instagram' | 'YouTube' | 'Twitter';

export type EngagementMetrics = {
  likes: number;
  comments: number;
  views?: number;
  retweets?: number;
  replies?: number;
};

export type Post = {
  id: string;
  url: string;
  platform: Platform;
  influencer: string;
  influencerHandle: string;
  thumbnailUrl: string;
  date: string; // ISO 8601 format
  engagement: EngagementMetrics;
};
