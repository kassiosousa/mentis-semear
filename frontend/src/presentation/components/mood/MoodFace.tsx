import type { MoodScore } from '@/domain/mood/entities/MoodSummary';
import { MOOD_SCORES, moodLabel } from '@/domain/mood/entities/MoodSummary';
import { cn } from '@/lib/utils';
import {
  FACE_ICONS,
  FACE_SIZES,
  type MoodFaceSize,
  moodTextClass,
  moodTintClass,
  NEUTRAL_ICON,
} from '@/presentation/components/mood/moodTone';

interface MoodFaceProps {
  score: MoodScore | null;
  size?: MoodFaceSize;
  dimmed?: boolean;
  label?: string;
  className?: string;
}

export function MoodFace({ score, size = 'md', dimmed = false, label, className }: MoodFaceProps) {
  const Icon = score === null ? NEUTRAL_ICON : FACE_ICONS[score];

  return (
    <Icon
      role={label === undefined ? undefined : 'img'}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      className={cn(
        FACE_SIZES[size],
        'shrink-0 transition-colors',
        moodTextClass(score, dimmed),
        className,
      )}
    />
  );
}

interface MoodFaceBadgeProps {
  score: MoodScore | null;
  size?: MoodFaceSize;
  label?: string;
  className?: string;
}

export function MoodFaceBadge({ score, size = 'xl', label, className }: MoodFaceBadgeProps) {
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-full p-3 ring-1',
        moodTintClass(score),
        className,
      )}
    >
      <MoodFace score={score} size={size} label={label} />
    </span>
  );
}

interface MoodFaceScaleProps {
  active?: MoodScore | null;
  size?: MoodFaceSize;
  showLabels?: boolean;
  showEnds?: boolean;
  className?: string;
}

export function MoodFaceScale({
  active = null,
  size = 'md',
  showLabels = false,
  showEnds = false,
  className,
}: MoodFaceScaleProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        role="img"
        aria-label={`Escala de humor de ${moodLabel(1).toLowerCase()} a ${moodLabel(5).toLowerCase()}${
          active === null ? '' : `, atual: ${moodLabel(active).toLowerCase()}`
        }`}
        className="flex items-start gap-1.5 sm:gap-2"
      >
        {MOOD_SCORES.map((score) => (
          <div key={score} className="flex min-w-0 flex-col items-center gap-1">
            <MoodFace
              score={score}
              size={size}
              dimmed={active !== null && active !== score}
              className={cn(active === score && 'scale-110')}
            />

            {showLabels && (
              <span
                className={cn(
                  'text-center text-[10px] leading-tight',
                  active === score ? 'font-medium text-title' : 'text-muted-foreground',
                )}
              >
                {moodLabel(score)}
              </span>
            )}
          </div>
        ))}
      </div>

      {showEnds && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Ruim</span>
          <span>Excelente</span>
        </div>
      )}
    </div>
  );
}
