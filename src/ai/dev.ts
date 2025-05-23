import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-additional-emotions.ts';
import '@/ai/flows/provide-personalized-feedback.ts';
import '@/ai/flows/analyze-audio-emotion.ts';