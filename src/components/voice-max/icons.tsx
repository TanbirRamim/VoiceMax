import type { LucideIcon } from 'lucide-react';
import {
  Smile,
  Frown,
  Angry,
  Meh,
  ShieldAlert,
  Zap,
  ThumbsUp,
  Brain,
  Sparkles,
  HeartPulse,
  Palette,
} from 'lucide-react';

export const emotionIcons: Record<string, LucideIcon> = {
  // Positive
  happy: Smile,
  joy: Smile,
  elated: Smile,
  excited: Zap,
  content: ThumbsUp,
  pleased: ThumbsUp,
  grateful: HeartPulse,
  hopeful: Sparkles,
  love: HeartPulse,
  amusement: Palette, // Using Palette for creative/amused

  // Negative
  sad: Frown,
  sorrow: Frown,
  gloomy: Frown,
  angry: Angry,
  anger: Angry,
  irate: Angry,
  frustrated: Angry,
  anxious: ShieldAlert,
  fear: ShieldAlert,
  worried: ShieldAlert,
  nervous: ShieldAlert,
  stressed: ShieldAlert,

  // Neutral / Other
  neutral: Meh,
  calm: Meh, // Could use a different icon if available, like Leaf
  surprised: Sparkles, // Using Sparkles for surprise
  confused: Brain, // Or help-circle
  curious: Brain,
  bored: Meh,

  // Default/Fallback
  default: Brain,
};

export const getEmotionIcon = (emotion?: string | null): LucideIcon => {
  if (!emotion) return Brain;
  const lowerEmotion = emotion.toLowerCase();
  return emotionIcons[lowerEmotion] || Brain;
};
