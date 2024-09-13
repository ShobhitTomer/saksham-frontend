"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { groupCrimesByYear } from "@/data/yearWise"
import data from "../../data/data.json"

export const description = "A linear line chart"



const chartConfig = {
  crimes: {
    label: "crimes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig
type CrimeReportArray = CrimeReport[];
import { CrimeReport } from "@/types/type";

const LineChartComponent=()=> {
  const typedData: CrimeReportArray = data as CrimeReportArray;
  const res = groupCrimesByYear(typedData)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Linear</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={res }
            margin={{
              left: 12 ,
              right: 12,
            }}
            
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
             
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="crimes"
              type="linear"
              stroke="var(--color-crimes)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Year wise Crime Data <TrendingUp className="h-4 w-4" />
        </div>
       
      </CardFooter>
    </Card>
  )
}


export default LineChartComponent