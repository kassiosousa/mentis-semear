import { Angry, Frown, Laugh, type LucideIcon, Meh, Smile } from 'lucide-react';
import type { MoodScore } from '@/domain/mood/entities/MoodSummary';

export const FACE_ICONS: Record<MoodScore, LucideIcon> = {
  1: Angry,
  2: Frown,
  3: Meh,
  4: Smile,
  5: Laugh,
};

export const NEUTRAL_ICON: LucideIcon = Meh;

const FACE_COLORS: Record<MoodScore, string> = {
  1: 'text-mood-1',
  2: 'text-mood-2',
  3: 'text-mood-3',
  4: 'text-mood-4',
  5: 'text-mood-5',
};

const FACE_TINTS: Record<MoodScore, string> = {
  1: 'bg-mood-1/10 ring-mood-1/25',
  2: 'bg-mood-2/10 ring-mood-2/25',
  3: 'bg-mood-3/10 ring-mood-3/25',
  4: 'bg-mood-4/10 ring-mood-4/25',
  5: 'bg-mood-5/10 ring-mood-5/25',
};

const FACE_BARS: Record<MoodScore, string> = {
  1: 'bg-mood-1',
  2: 'bg-mood-2',
  3: 'bg-mood-3',
  4: 'bg-mood-4',
  5: 'bg-mood-5',
};

export const FACE_SIZES = {
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-9',
} as const;

export type MoodFaceSize = keyof typeof FACE_SIZES;

export function moodTextClass(score: MoodScore | null, dimmed = false): string {
  if (score === null) return 'text-muted-foreground/50';

  return dimmed ? 'text-muted-foreground/45' : FACE_COLORS[score];
}

export function moodTintClass(score: MoodScore | null): string {
  return score === null ? 'bg-muted ring-border' : FACE_TINTS[score];
}

export function moodBarClass(score: MoodScore): string {
  return FACE_BARS[score];
}
