import { CalendarIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/presentation/components/ui/button"
import { Calendar } from "@/presentation/components/ui/calendar"
import { Input } from "@/presentation/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/presentation/components/ui/popover"

const DEFAULT_TIME = "09:00"

function parseLocal(value: string): Date | undefined {
  if (value === "") return undefined

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function toLocalValue(date: Date, time: string): string {
  const [hours, minutes] = time.split(":")
  const merged = new Date(date)
  merged.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0)

  return `${merged.getFullYear()}-${pad(merged.getMonth() + 1)}-${pad(merged.getDate())}T${pad(merged.getHours())}:${pad(merged.getMinutes())}`
}

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  id?: string
  invalid?: boolean
  disabled?: boolean
  portal?: boolean
}

function DateTimePicker({
  value,
  onChange,
  id,
  invalid = false,
  disabled = false,
  portal = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected = parseLocal(value)
  const time = selected === undefined ? "" : `${pad(selected.getHours())}:${pad(selected.getMinutes())}`

  const onSelectDate = (date: Date | undefined) => {
    if (date === undefined) return

    onChange(toLocalValue(date, time === "" ? DEFAULT_TIME : time))
    setOpen(false)
  }

  const onChangeTime = (next: string) => {
    onChange(toLocalValue(selected ?? new Date(), next === "" ? DEFAULT_TIME : next))
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            className={cn(
              "h-10 flex-1 justify-start font-normal",
              selected === undefined && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {selected === undefined
              ? "Selecione a data"
              : selected.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
          </Button>
        </PopoverTrigger>

        <PopoverContent portal={portal} className="p-0">
          <Calendar mode="single" selected={selected} onSelect={onSelectDate} autoFocus />
        </PopoverContent>
      </Popover>

      <Input
        type="time"
        aria-label="Hora"
        value={time}
        onChange={(event) => onChangeTime(event.target.value)}
        disabled={disabled}
        aria-invalid={invalid}
        className="h-10 w-28"
      />
    </div>
  )
}

export { DateTimePicker }
