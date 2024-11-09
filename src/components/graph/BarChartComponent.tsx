'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, CalendarIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { format, setYear, setMonth } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import data from "../../data/data.json"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CrimeReport } from '@/types/type'

const chartConfig = {
  crimes: {
    label: "Crimes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type CrimeReportArray = CrimeReport[];

const crimeData: CrimeReportArray = data as CrimeReportArray;

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const excelDateToJSDate = (excelDate: number) => {
  return new Date((excelDate - 25569) * 86400 * 1000);
};

const CustomDatePicker = ({ date, setDate, label }: { date: Date | undefined, setDate: (date: Date | undefined) => void, label: string }) => {
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMMM yyyy") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 flex flex-col space-y-4">
          <Select
            value={date ? date.getFullYear().toString() : ""}
            onValueChange={(value) => setDate(date ? setYear(date, parseInt(value)) : new Date(parseInt(value), 0, 1))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((month, index) => (
              <Button
                key={month}
                variant="outline"
                size="sm"
                onClick={() => setDate(date ? setMonth(date, index) : new Date(new Date().getFullYear(), index, 1))}
                className={cn(
                  "text-sm",
                  date && date.getMonth() === index && "bg-primary text-primary-foreground"
                )}
              >
                {month.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function BarChartComponent() {
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date(2022, 0, 1))
  const [toDate, setToDate] = useState<Date | undefined>(new Date(2024, 11, 31))

  const processedData = useMemo(() => {
    if (!fromDate || !toDate) return []

    const groupedData: { [key: string]: number } = {}

    crimeData.forEach(crime => {
      const crimeDate = excelDateToJSDate(crime.case_date)
      if (crimeDate >= fromDate && crimeDate <= toDate) {
        const key = `${crimeDate.getFullYear()}-${monthNames[crimeDate.getMonth()]}`
        groupedData[key] = (groupedData[key] || 0) + 1
      }
    })

    return Object.entries(groupedData).map(([key, value]) => ({
      key,
      crimes: value
    })).sort((a, b) => a.key.localeCompare(b.key))
  }, [fromDate, toDate])

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Crime Data Visualization</CardTitle>
              <CardDescription>Select date range to view crime data</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <CustomDatePicker date={fromDate} setDate={setFromDate} label="Select start date" />
            <CustomDatePicker date={toDate} setDate={setToDate} label="Select end date" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={processedData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="key"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.split('-')[1].slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="crimes" fill="var(--color-crimes)" radius={[8, 8, 0, 0]}>
                <LabelList
                  dataKey="crimes"
                  position="top"
                  offset={10}
                  fill="var(--color-crimes)"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing Crime Data from {fromDate ? format(fromDate, "MMMM yyyy") : ''} to {toDate ? format(toDate, "MMMM yyyy") : ''} <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}
