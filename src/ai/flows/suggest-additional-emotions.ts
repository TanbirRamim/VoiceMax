'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting additional emotions
 * that might be present in an audio file, beyond the primary detected emotion.
 *
 * - suggestAdditionalEmotions -  A function that initiates the emotion suggestion flow.
 * - SuggestAdditionalEmotionsInput - The input type for the suggestAdditionalEmotions function.
 * - SuggestAdditionalEmotionsOutput - The output type for the suggestAdditionalEmotions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAdditionalEmotionsInputSchema = z.object({
  primaryEmotion: z.string().describe('The primary emotion detected in the audio.'),
  audioAnalysisContext: z
    .string()
    .describe(
      'Contextual information about the audio analysis, including the content and any relevant details.'
    ),
});
export type SuggestAdditionalEmotionsInput = z.infer<typeof SuggestAdditionalEmotionsInputSchema>;

const SuggestAdditionalEmotionsOutputSchema = z.object({
  suggestedEmotions: z
    .array(z.string())
    .describe('An array of additional emotions suggested by the analysis.'),
});
export type SuggestAdditionalEmotionsOutput = z.infer<typeof SuggestAdditionalEmotionsOutputSchema>;

export async function suggestAdditionalEmotions(
  input: SuggestAdditionalEmotionsInput
): Promise<SuggestAdditionalEmotionsOutput> {
  return suggestAdditionalEmotionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAdditionalEmotionsPrompt',
  input: {schema: SuggestAdditionalEmotionsInputSchema},
  output: {schema: SuggestAdditionalEmotionsOutputSchema},
  prompt: `Based on the primary emotion of {{{primaryEmotion}}} and the following audio analysis context: {{{audioAnalysisContext}}},
  suggest up to 3 additional emotions that might also be present. Justify your suggestions briefly.
  Return an array of strings.
  If no additional emotions are likely, return an empty array.
  `,
});

const suggestAdditionalEmotionsFlow = ai.defineFlow(
  {
    name: 'suggestAdditionalEmotionsFlow',
    inputSchema: SuggestAdditionalEmotionsInputSchema,
    outputSchema: SuggestAdditionalEmotionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
