import type { Post, Campaign } from './types';

export const campaigns: Campaign[] = [
  {
    id: 'summer-sale-2024',
    name: 'Summer Sale 2024',
    postIds: ['1', '2', '4'],
  },
  {
    id: 'product-launch-q3',
    name: 'Product Launch Q3',
    postIds: ['3', '5', '6'],
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    campaignId: 'summer-sale-2024',
    url: 'https://www.instagram.com/p/C1234567890/',
    platform: 'Instagram',
    influencer: 'Alex Doe',
    influencerHandle: '@alexdoe',
    thumbnailUrl: 'https://placehold.co/400x500',
    date: '2024-07-20T10:00:00Z',
    engagement: {
      likes: 15032,
      comments: 874,
      views: 120543,
    },
  },
  {
    id: '2',
    campaignId: 'summer-sale-2024',
    url: 'https://www.youtube.com/watch?v=abcdef12345',
    platform: 'YouTube',
    influencer: 'Ben Creative',
    influencerHandle: '@bencreative',
    thumbnailUrl: 'https://placehold.co/400x225',
    date: '2024-07-19T18:30:00Z',
    engagement: {
      likes: 88000,
      comments: 4200,
      views: 1200000,
    },
  },
  {
    id: '3',
    campaignId: 'product-launch-q3',
    url: 'https://twitter.com/caseydev/status/1234567890123456789',
    platform: 'Twitter',
    influencer: 'Casey Dev',
    influencerHandle: '@caseydev',
    thumbnailUrl: 'https://placehold.co/400x250',
    date: '2024-07-18T12:00:00Z',
    engagement: {
      likes: 5200,
      comments: 312,
      retweets: 1800,
    },
  },
  {
    id: '4',
    campaignId: 'summer-sale-2024',
    url: 'https://www.instagram.com/p/C2345678901/',
    platform: 'Instagram',
    influencer: 'Dana Fashion',
    influencerHandle: '@danafashion',
    thumbnailUrl: 'https://placehold.co/400x500',
    date: '2024-07-17T09:00:00Z',
    engagement: {
      likes: 25480,
      comments: 1230,
      views: 210870,
    },
  },
  {
    id: '5',
    campaignId: 'product-launch-q3',
    url: 'https://twitter.com/techguru/status/1234567890123456789',
    platform: 'Twitter',
    influencer: 'Casey Dev',
    influencerHandle: '@caseydev',
    thumbnailUrl: 'https://placehold.co/400x250',
    date: '2024-06-30T15:20:00Z',
    engagement: {
      likes: 780,
      comments: 55,
      retweets: 230,
    },
  },
  {
    id: '6',
    campaignId: 'product-launch-q3',
    url: 'https://www.youtube.com/watch?v=ghijk67890',
    platform: 'YouTube',
    influencer: 'Ethan Gamer',
    influencerHandle: '@ethangamer',
    thumbnailUrl: 'https://placehold.co/400x225',
    date: '2024-06-25T20:00:00Z',
    engagement: {
      likes: 150000,
      comments: 11000,
      views: 3500000,
    },
  },
];
