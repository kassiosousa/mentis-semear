import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

const DEFAULT_MAX = 10

interface StarRatingProps {
  value: number | null
  onChange: (value: number) => void
  id?: string
  max?: number
  label?: string
  invalid?: boolean
  disabled?: boolean
}

function StarRating({
  value,
  onChange,
  id,
  max = DEFAULT_MAX,
  label = "Nota",
  invalid = false,
  disabled = false,
}: StarRatingProps) {
  const [preview, setPreview] = React.useState<number | null>(null)
  const stars = React.useRef<Array<HTMLButtonElement | null>>([])

  const scores = Array.from({ length: max }, (_, index) => index + 1)
  const active = preview ?? value ?? 0
  const focusable = value ?? 1

  const select = (score: number) => {
    onChange(score)
    stars.current[score - 1]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = value ?? 0

    const next =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? Math.min(current + 1, max)
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? Math.max(current - 1, 1)
          : event.key === "Home"
            ? 1
            : event.key === "End"
              ? max
              : null

    if (next === null) return

    event.preventDefault()
    select(next)
  }

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid}
      aria-disabled={disabled}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setPreview(null)}
      className={cn("flex items-center gap-0.5 sm:gap-1", disabled && "opacity-50")}
    >
      {scores.map((score) => (
        <button
          key={score}
          ref={(node) => {
            stars.current[score - 1] = node
          }}
          type="button"
          role="radio"
          aria-checked={value === score}
          aria-label={`${score} de ${max}`}
          tabIndex={score === focusable ? 0 : -1}
          disabled={disabled}
          onClick={() => select(score)}
          onMouseEnter={() => setPreview(score)}
          onFocus={() => setPreview(score)}
          onBlur={() => setPreview(null)}
          className="rounded-md p-0.5 outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 enabled:hover:scale-110 disabled:pointer-events-none"
        >
          <Star
            className={cn(
              "size-6 transition-colors sm:size-7",
              score <= active
                ? "fill-primary text-primary"
                : "fill-muted text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export { StarRating }
