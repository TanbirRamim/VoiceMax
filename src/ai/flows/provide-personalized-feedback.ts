// src/ai/flows/provide-personalized-feedback.ts
'use server';

/**
 * @fileOverview Provides personalized feedback based on detected emotion.
 *
 * - providePersonalizedFeedback - A function to provide personalized feedback.
 * - ProvidePersonalizedFeedbackInput - Input type for the function.
 * - ProvidePersonalizedFeedbackOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvidePersonalizedFeedbackInputSchema = z.object({
  emotion: z.string().describe('The primary emotion detected from the audio.'),
});
export type ProvidePersonalizedFeedbackInput = z.infer<typeof ProvidePersonalizedFeedbackInputSchema>;

const ProvidePersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback based on the detected emotion.'),
  suggestion: z.string().optional().describe('Suggestion for breathing exercise if the emotion is negative.'),
});
export type ProvidePersonalizedFeedbackOutput = z.infer<typeof ProvidePersonalizedFeedbackOutputSchema>;

const breathingExerciseTool = ai.defineTool({
  name: 'breathingExerciseSuggestion',
  description: 'Suggests a breathing exercise to help manage negative emotions.',
  inputSchema: z.object({
    emotion: z.string().describe('The emotion experienced by the user'),
  }),
  outputSchema: z.string().describe('A description of a breathing exercise.'),
},
async (input) => {
    // A real implementation would call an external API or service.
    // For this example, we'll just return a canned response.
    if (input.emotion === 'negative') {
      return 'Try the 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.';
    } else {
      return 'No specific breathing exercise is needed, but mindful breathing can always be beneficial.';
    }
  }
);

export async function providePersonalizedFeedback(input: ProvidePersonalizedFeedbackInput): Promise<ProvidePersonalizedFeedbackOutput> {
  return providePersonalizedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'providePersonalizedFeedbackPrompt',
  input: {schema: ProvidePersonalizedFeedbackInputSchema},
  output: {schema: ProvidePersonalizedFeedbackOutputSchema},
  tools: [breathingExerciseTool],
  prompt: `You are an AI assistant designed to provide personalized feedback based on detected emotions.

  The detected emotion is: {{{emotion}}}

  If the emotion is positive (e.g., happy, excited, content), provide a short, positive reinforcement message.
  If the emotion is negative (e.g., sad, angry, anxious), provide a motivational message and suggest a breathing exercise using the breathingExerciseSuggestion tool.
  Always keep your feedback concise and supportive.

  Output the result in the following JSON format:
  {
    "feedback": "",
    "suggestion": ""
  }`,
});

const providePersonalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'providePersonalizedFeedbackFlow',
    inputSchema: ProvidePersonalizedFeedbackInputSchema,
    outputSchema: ProvidePersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
