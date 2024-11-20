"use client"

import { useState, useMemo } from "react"
import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import data from "../../data/data.json"
import { CrimeReport } from "@/types/type"

const chartConfig = {
  crimes: {
    label: "Crimes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type CrimeReportArray = CrimeReport[]

const crimeData: CrimeReportArray = data as CrimeReportArray

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const excelDateToJSDate = (excelDate: number) => {
  return new Date((excelDate - 25569) * 86400 * 1000)
}

export default function BarChartComponent({
  dateRange,
  ageGroup,
}: {
  dateRange: DateRange | undefined
  ageGroup: string
}) {
  const processedData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []

    const groupedData: { [key: string]: number } = {}

    crimeData.forEach((crime) => {
      const crimeDate = excelDateToJSDate(crime.case_date)
      if (crimeDate >= dateRange.from && crimeDate <= dateRange.to) {
        if (ageGroup !== "All") {
          const [minAge, maxAge] = ageGroup.split("-")
          if (maxAge) {
            if (crime.age < parseInt(minAge) || crime.age > parseInt(maxAge)) {
              return
            }
          } else if (parseInt(minAge) === 60 && crime.age < 60) {
            return
          }
        }

        const key = `${crimeDate.getFullYear()}-${monthNames[crimeDate.getMonth()]}`
        groupedData[key] = (groupedData[key] || 0) + 1
      }
    })

    return Object.entries(groupedData)
      .map(([key, value]) => ({
        key,
        crimes: value,
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [dateRange, ageGroup])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crime Data Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="key"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.split("-")[1].slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="crimes"
                fill="var(--color-crimes)"
                radius={[8, 8, 0, 0]}
              >
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
          Showing Crime Data from{" "}
          {dateRange?.from ? format(dateRange.from, "MMMM yyyy") : ""} to{" "}
          {dateRange?.to ? format(dateRange.to, "MMMM yyyy") : ""} for age group{" "}
          {ageGroup} <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}