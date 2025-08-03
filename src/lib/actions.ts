'use server';

import { generateCampaignSummary, CampaignSummaryInput, CampaignSummaryOutput } from '@/ai/flows/campaign-summary';

export async function getCampaignSummary(input: CampaignSummaryInput): Promise<CampaignSummaryOutput & { error?: string }> {
  try {
    const result = await generateCampaignSummary(input);
    return result;
  } catch (error) {
    console.error('Error generating campaign summary:', error);
    return { summary: '', error: 'Failed to generate campaign summary. Please try again later.' };
  }
}
