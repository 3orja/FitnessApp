"use client"
import { format, parseISO, eachDayOfInterval, subDays, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CalendarHeatmapProps {
  data: Array<{ date: string; value?: number; label?: string }>
  days?: number
  colorScheme?: "green" | "blue" | "purple"
}

export function CalendarHeatmap({ data, days = 60, colorScheme = "green" }: CalendarHeatmapProps) {
  const today = new Date()
  const startDate = subDays(today, days)

  const dateRange = eachDayOfInterval({
    start: startDate,
    end: today,
  })

  const getColorClass = (value: number | undefined) => {
    if (!value) return "bg-muted"

    const colorMap = {
      green: [
        "bg-green-100 dark:bg-green-950",
        "bg-green-200 dark:bg-green-900",
        "bg-green-300 dark:bg-green-800",
        "bg-green-400 dark:bg-green-700",
        "bg-green-500 dark:bg-green-600",
      ],
      blue: [
        "bg-blue-100 dark:bg-blue-950",
        "bg-blue-200 dark:bg-blue-900",
        "bg-blue-300 dark:bg-blue-800",
        "bg-blue-400 dark:bg-blue-700",
        "bg-blue-500 dark:bg-blue-600",
      ],
      purple: [
        "bg-purple-100 dark:bg-purple-950",
        "bg-purple-200 dark:bg-purple-900",
        "bg-purple-300 dark:bg-purple-800",
        "bg-purple-400 dark:bg-purple-700",
        "bg-purple-500 dark:bg-purple-600",
      ],
    }

    const colors = colorMap[colorScheme]

    if (value <= 0.2) return colors[0]
    if (value <= 0.4) return colors[1]
    if (value <= 0.6) return colors[2]
    if (value <= 0.8) return colors[3]
    return colors[4]
  }

  const getDayData = (date: Date) => {
    return data.find((item) => isSameDay(parseISO(item.date), date))
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-wrap gap-1 min-w-[600px]">
        {dateRange.map((date) => {
          const dayData = getDayData(date)
          const colorClass = getColorClass(dayData?.value)

          return (
            <TooltipProvider key={date.toISOString()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("w-3 h-3 rounded-sm cursor-pointer", colorClass)} />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <div>{format(date, "dd MMM yyyy", { locale: es })}</div>
                    {dayData && <div className="font-medium">{dayData.label || `Valor: ${dayData.value}`}</div>}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}

