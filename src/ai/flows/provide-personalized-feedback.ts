// src/ai/flows/provide-personalized-feedback.ts
'use server';

/**
 * @fileOverview Provides personalized feedback based on detected emotion,
 * including specific exercise suggestions for negative emotions.
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
  suggestion: z.string().optional().describe('A specific coping exercise (e.g., breathing technique) if the emotion is negative, or a general supportive tip.'),
});
export type ProvidePersonalizedFeedbackOutput = z.infer<typeof ProvidePersonalizedFeedbackOutputSchema>;

const breathingExerciseTool = ai.defineTool({
  name: 'breathingExerciseSuggestion',
  description: 'Suggests a specific breathing or mindfulness exercise to help manage negative emotions based on the type of emotion.',
  inputSchema: z.object({
    emotion: z.string().describe('The negative emotion experienced by the user (e.g., anxious, sad, angry).'),
  }),
  outputSchema: z.string().describe('A description of a specific breathing or mindfulness exercise tailored to the emotion.'),
},
async (input) => {
    const emotion = input.emotion.toLowerCase();

    if (['anxious', 'anxiety', 'stressed', 'stress', 'worried', 'nervous', 'fear'].some(e => emotion.includes(e))) {
      return 'Try Box Breathing: Inhale for 4 seconds, hold your breath for 4 seconds, exhale for 4 seconds, and then hold your breath again for 4 seconds. Repeat this cycle several times to calm your nervous system.';
    }
    if (['sad', 'sadness', 'gloomy', 'sorrow', 'grief', 'disappointed'].some(e => emotion.includes(e))) {
      return 'Consider Gentle Rhythmic Breathing: Inhale softly and deeply for a count of 3 or 4, and then exhale slowly and completely for a count of 5 or 6. Focusing on a longer exhale can be soothing.';
    }
    if (['angry', 'anger', 'irate', 'frustrated', 'irritated'].some(e => emotion.includes(e))) {
      return 'Practice a Calming Exhale: Inhale normally through your nose. Then, exhale slowly and steadily through pursed lips (as if blowing out a candle) for as long as is comfortable. Repeat 5-10 times to release tension.';
    }
    // Default for other negative emotions or if the category isn't matched precisely
    return 'Mindful breathing can be very helpful. Simply focus on the natural rhythm of your breath. Notice the sensation of the air entering your nostrils and filling your lungs, and then the sensation of it leaving your body. If your mind wanders, gently bring your attention back to your breath.';
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
  prompt: `You are an AI assistant designed to provide empathetic and personalized feedback based on detected emotions.

  The detected emotion is: {{{emotion}}}

  If the emotion is positive (e.g., happy, excited, content), provide a short, encouraging, and positive reinforcement message. In this case, the suggestion field can be a general well-being tip or left brief.
  If the emotion is negative (e.g., sad, angry, anxious, stressed), provide an understanding and motivational message. Crucially, for negative emotions, use the 'breathingExerciseSuggestion' tool to get a specific, tailored breathing or mindfulness exercise and include that exercise in the "suggestion" field of your response.
  
  Always keep your feedback concise, supportive, and easy to understand.

  Output the result in the following JSON format:
  {
    "feedback": "Your feedback message here.",
    "suggestion": "The specific exercise from the tool if emotion is negative, or a general tip/empty for positive emotions."
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
