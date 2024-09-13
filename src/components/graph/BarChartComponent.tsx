'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import data from "../../data/data.json"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
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

const BarChartComponent = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2022')

  const years = useMemo(() => {
    const uniqueYears = new Set(crimeData.map(crime => excelDateToJSDate(crime.case_date).getFullYear().toString()))
    return Array.from(uniqueYears).sort().reverse()
  }, [])

  const processedData = useMemo(() => {
    const dataByMonth: { [key: string]: number } = {};
    crimeData.forEach(crime => {
      const date = excelDateToJSDate(crime.case_date);
      if (date.getFullYear().toString() === selectedYear) {
        const monthName = monthNames[date.getMonth()];
        dataByMonth[monthName] = (dataByMonth[monthName] || 0) + 1;
      }
    });
    return monthNames.map(month => ({ month, crimes: dataByMonth[month] || 0 }));
  }, [selectedYear])

  const totalCrimes = processedData.reduce((sum, item) => sum + item.crimes, 0)
  const averageCrimes = totalCrimes / processedData.length
  const maxCrimes = Math.max(...processedData.map(item => item.crimes))
  const minCrimes = Math.min(...processedData.map(item => item.crimes))

  const previousYearData = useMemo(() => {
    const prevYear = (parseInt(selectedYear) - 1).toString()
    const dataByMonth: { [key: string]: number } = {};
    crimeData.forEach(crime => {
      const date = excelDateToJSDate(crime.case_date);
      if (date.getFullYear().toString() === prevYear) {
        const monthName = monthNames[date.getMonth()];
        dataByMonth[monthName] = (dataByMonth[monthName] || 0) + 1;
      }
    });
    return monthNames.map(month => ({ month, crimes: dataByMonth[month] || 0 }));
  }, [selectedYear])

  const yearOverYearChange = useMemo(() => {
    const currentTotal = processedData.reduce((sum, item) => sum + item.crimes, 0)
    const previousTotal = previousYearData.reduce((sum, item) => sum + item.crimes, 0)
    return previousTotal !== 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0
  }, [processedData, previousYearData])
  
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Month Wise Crime</CardTitle>
            <CardDescription>Select a year to view crime data</CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Total Crimes</span>
            <span className="text-2xl font-bold">{totalCrimes}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Average per Month</span>
            <span className="text-2xl font-bold">{averageCrimes.toFixed(0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Highest Month</span>
            <span className="text-2xl font-bold">{maxCrimes}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Lowest Month</span>
            <span className="text-2xl font-bold">{minCrimes}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span>Year-over-Year Change:</span>
          <span className={`flex items-center ${yearOverYearChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {yearOverYearChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(yearOverYearChange).toFixed(2)}%
          </span>
        </div>
        <div className="flex gap-2 font-medium leading-none">
          Showing Month Wise Crimes for {selectedYear} <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}

export default BarChartComponent