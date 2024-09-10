import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import data from "../../data/data.json"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CrimeReport } from "@/types/type";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { monthCrime } from "@/data/MonthCrime"

export const description = "A bar chart with a label"





const chartConfig = {
  crimes: {
    label: "crimes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type CrimeReportArray = CrimeReport[];
const BarChartComponent =()=> {
  const typedData: CrimeReportArray = data as CrimeReportArray;
  const res = monthCrime(typedData);
  const monthOrder = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const sortedData = res.sort((a, b) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Month Wise Crime</CardTitle>
        <CardDescription>January - December</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={sortedData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="crimes" fill="var(--color-crimes)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing Month Wise Crimes(Total) <TrendingUp className="h-4 w-4" />
        </div>
        
      </CardFooter>
    </Card>
  )
}


export default BarChartComponent