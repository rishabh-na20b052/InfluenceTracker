'use server';
/**
 * @fileOverview Generates a summary of the campaign's overall performance.
 *
 * - generateCampaignSummary - A function that generates a campaign performance summary.
 * - CampaignSummaryInput - The input type for the generateCampaignSummary function.
 * - CampaignSummaryOutput - The return type for the generateCampaignSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CampaignSummaryInputSchema = z.object({
  totalPostsTracked: z.number().describe('The total number of posts tracked in the campaign.'),
  cumulativeEngagementStats: z.string().describe('Cumulative engagement statistics for all tracked posts.'),
  topPerformingPosts: z.string().describe('A list of top-performing posts with their engagement metrics.'),
});
export type CampaignSummaryInput = z.infer<typeof CampaignSummaryInputSchema>;

const CampaignSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the campaign performance, including key metrics and top-performing posts.'),
});
export type CampaignSummaryOutput = z.infer<typeof CampaignSummaryOutputSchema>;

export async function generateCampaignSummary(input: CampaignSummaryInput): Promise<CampaignSummaryOutput> {
  return campaignSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'campaignSummaryPrompt',
  input: {schema: CampaignSummaryInputSchema},
  output: {schema: CampaignSummaryOutputSchema},
  prompt: `You are an expert marketing analyst summarizing campaign performance.

  Based on the following data, generate a concise summary of the campaign's overall performance, including key metrics and top-performing posts.

  Total Posts Tracked: {{{totalPostsTracked}}}
  Cumulative Engagement Stats: {{{cumulativeEngagementStats}}}
  Top Performing Posts: {{{topPerformingPosts}}}
  `,
});

const campaignSummaryFlow = ai.defineFlow(
  {
    name: 'campaignSummaryFlow',
    inputSchema: CampaignSummaryInputSchema,
    outputSchema: CampaignSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
