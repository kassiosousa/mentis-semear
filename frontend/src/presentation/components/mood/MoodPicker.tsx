import type { MoodScore } from '@/domain/mood/entities/MoodSummary';
import { MOOD_SCORES, moodLabel } from '@/domain/mood/entities/MoodSummary';
import { cn } from '@/lib/utils';
import { MoodFace } from '@/presentation/components/mood/MoodFace';
import { moodTintClass } from '@/presentation/components/mood/moodTone';

interface MoodPickerProps {
  id?: string;
  value: MoodScore | null;
  onChange: (score: MoodScore) => void;
  disabled?: boolean;
  invalid?: boolean;
}

export function MoodPicker({
  id,
  value,
  onChange,
  disabled = false,
  invalid = false,
}: MoodPickerProps) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Como você está se sentindo"
      aria-invalid={invalid || undefined}
      className={cn(
        'grid grid-cols-5 gap-1.5 rounded-xl sm:gap-3',
        invalid && 'ring-2 ring-destructive/40',
      )}
    >
      {MOOD_SCORES.map((score) => {
        const active = value === score;

        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={moodLabel(score)}
            disabled={disabled}
            onClick={() => onChange(score)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border p-2 ring-inset transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 sm:gap-2 sm:p-3',
              active
                ? cn('border-transparent ring-2', moodTintClass(score))
                : 'border-border hover:bg-muted',
            )}
          >
            <MoodFace
              score={score}
              size="xl"
              dimmed={value !== null && !active}
              className={cn('transition-transform', active && 'scale-110')}
            />

            <span
              className={cn(
                'text-center text-[11px] leading-tight',
                active ? 'font-medium text-title' : 'text-muted-foreground',
              )}
            >
              {moodLabel(score)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
