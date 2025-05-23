// src/ai/flows/analyze-audio-emotion.ts
'use server';

/**
 * @fileOverview Analyzes uploaded audio to detect the primary emotion expressed,
 * perceived stress level, and notable speech characteristics.
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
  perceivedStressLevel: z.string().describe('A qualitative description of the perceived stress level in the voice (e.g., calm, moderate stress, high tension).'),
  speechCharacteristics: z.string().describe('Observations about speech patterns like pace, pauses, or fluency (e.g., fluid and confident, some hesitation, frequent pauses, rapid pace).'),
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
Also, provide a qualitative assessment of the perceived stress level (e.g., calm, moderate signs of stress, high tension)
and any notable speech characteristics (e.g., fluid and confident, some hesitation noted, frequent pauses, rapid pace with few pauses).

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
