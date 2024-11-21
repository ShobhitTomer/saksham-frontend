import { useState } from "react"
import BarChartComponent from "@/components/graph/BarChartComponent"
import HeatmapComponent from "@/components/graph/HeatMapLeaflet"
import LineChartComponent from "@/components/graph/LineChartComponent"
import PieChartComponent from "@/components/graph/PieChartComponent"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const HomePage = () => {
  const [date, setDate] = useState<DateRange | undefined>({ from: new Date(2021, 0, 1), to: new Date(2024, 11, 31) })
  const [ageGroup, setAgeGroup] = useState<string>("All")

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Saksham</h1>

      <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Age Group Selector */}
        <Select onValueChange={(value) => setAgeGroup(value)} defaultValue="All">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Age Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Ages</SelectItem>
            <SelectItem value="0-18">0-18</SelectItem>
            <SelectItem value="19-35">19-35</SelectItem>
            <SelectItem value="36-60">36-60</SelectItem>
            <SelectItem value="60+">60+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BarChartComponent dateRange={date} ageGroup={ageGroup} />
        <LineChartComponent />
        <PieChartComponent />
        <HeatmapComponent dateRange={date} ageGroup={ageGroup} />
      </div>
    </div>
  )
}

export default HomePage