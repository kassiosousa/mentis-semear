import { ptBR } from "date-fns/locale"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/presentation/components/ui/button"

function Calendar({ className, classNames, showOutsideDays = true, ...props }: DayPickerProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium capitalize text-title",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground hover:text-foreground disabled:opacity-40"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground hover:text-foreground disabled:opacity-40"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-[0.7rem] font-medium text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary [&>button]:hover:text-white",
        today: "[&>button]:font-semibold [&>button]:text-primary",
        outside: "[&>button]:text-muted-foreground/50",
        disabled: "[&>button]:pointer-events-none [&>button]:opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : orientation === "up"
                  ? ChevronUp
                  : ChevronDown

          return <Icon className={cn("size-4", chevronClass)} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
