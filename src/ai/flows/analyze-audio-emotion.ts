// src/ai/flows/analyze-audio-emotion.ts
'use server';

/**
 * @fileOverview Analyzes uploaded audio to detect the primary emotion expressed.
 *
 * - analyzeAudioEmotion - A function that handles the audio emotion analysis process.
 * - AnalyzeAudioEmotionInput - The input type for the analyzeAudioEmotion function.
 * - AnalyzeAudioEmotionOutput - The return type for the analyzeAudioEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAudioEmotionInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type AnalyzeAudioEmotionInput = z.infer<typeof AnalyzeAudioEmotionInputSchema>;

const AnalyzeAudioEmotionOutputSchema = z.object({
  primaryEmotion: z.string().describe('The primary emotion expressed in the audio.'),
});
export type AnalyzeAudioEmotionOutput = z.infer<typeof AnalyzeAudioEmotionOutputSchema>;

export async function analyzeAudioEmotion(input: AnalyzeAudioEmotionInput): Promise<AnalyzeAudioEmotionOutput> {
  return analyzeAudioEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAudioEmotionPrompt',
  input: {schema: AnalyzeAudioEmotionInputSchema},
  output: {schema: AnalyzeAudioEmotionOutputSchema},
  prompt: `Analyze the audio and detect the primary emotion expressed in it.

Audio: {{media url=audioDataUri}}`,
});

const analyzeAudioEmotionFlow = ai.defineFlow(
  {
    name: 'analyzeAudioEmotionFlow',
    inputSchema: AnalyzeAudioEmotionInputSchema,
    outputSchema: AnalyzeAudioEmotionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
