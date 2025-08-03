// Campaign cover image fallbacks - using public folder paths
export const campaignCoverFallbacks = [
  '/assets/campaign_dp1.webp',
  '/assets/campaign_dp2.webp',
  '/assets/campaign_dp3.webp',
];

// Admin profile image fallback
export const adminProfileFallback = '/assets/man_do.jpg';

// Get a deterministic campaign cover based on campaign ID
export function getCampaignCover(campaignId: string): string {
  // Use campaign ID to deterministically select a cover image
  const hash = campaignId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const index = Math.abs(hash) % campaignCoverFallbacks.length;
  return campaignCoverFallbacks[index];
}

// Get a random campaign cover fallback (for backward compatibility)
export function getRandomCampaignCover(): string {
  return campaignCoverFallbacks[0]; // Use first image as default
}

// Get admin profile image with fallback
export function getAdminProfileImage(): string {
  return adminProfileFallback;
}

// Check if an image URL is valid and return fallback if not
export function getImageWithFallback(
  imageUrl: string | null | undefined,
  fallbackType: 'campaign' | 'admin' = 'campaign'
): string {
  if (!imageUrl || imageUrl === '' || imageUrl.startsWith('data:')) {
    return fallbackType === 'admin' 
      ? adminProfileFallback 
      : getRandomCampaignCover();
  }
  
  // If it's a placeholder URL, use fallback
  if (imageUrl.includes('placehold.co') || imageUrl.includes('placeholder')) {
    return fallbackType === 'admin' 
      ? adminProfileFallback 
      : getRandomCampaignCover();
  }
  
  return imageUrl;
} 