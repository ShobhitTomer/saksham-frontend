/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({ dateRange, setDateRange }) {
  const [isSelectingStart, setIsSelectingStart] = React.useState(true);

  const handleDateSelect = (selectedDate: any) => {
    if (isSelectingStart) {
      setDateRange({ ...dateRange, startDate: selectedDate });
      setIsSelectingStart(false); // Next selection will be for end date
    } else {
      setDateRange({ ...dateRange, endDate: selectedDate });
      setIsSelectingStart(true); // Reset to start date selection
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            (!dateRange.startDate || !dateRange.endDate) && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.startDate && dateRange.endDate
            ? `${format(dateRange.startDate, "PPP")} - ${format(dateRange.endDate, "PPP")}`
            : <span>Select a date range</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={isSelectingStart ? dateRange.startDate : dateRange.endDate}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
