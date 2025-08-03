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
  campaignId: string;
  url: string;
  platform: Platform;
  influencer: string;
  influencerHandle: string;
  thumbnailUrl: string;
  date: string; // ISO 8601 format
  engagement: EngagementMetrics;
};

export type Campaign = {
  id: string;
  name: string;
  postIds: string[];
};
