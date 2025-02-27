"use client"

import { useMemo } from "react"
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"
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
import { format } from "date-fns"
import data from "../../data/data.json"
import { CrimeReport } from "@/types/type"
import { DateRange } from "react-day-picker"

// Using the original color scheme
const chartConfig = {
  age018: {
    label: "0-18",
    color: "hsl(var(--chart-1))",
  },
  age1925: {
    label: "19-25",
    color: "hsl(var(--chart-2))",
  },
  age2635: {
    label: "26-35",
    color: "hsl(var(--chart-3))",
  },
  age3660: {
    label: "36-60",
    color: "hsl(var(--chart-4))",
  },
  age60plus: {
    label: "60+",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

// Define age groups
const ageRanges = [
  { name: "0-18", min: 0, max: 18, dataKey: "age018", fill: "var(--color-age018)" },
  { name: "19-25", min: 19, max: 25, dataKey: "age1925", fill: "var(--color-age1925)" },
  { name: "26-35", min: 26, max: 35, dataKey: "age2635", fill: "var(--color-age2635)" },
  { name: "36-60", min: 36, max: 60, dataKey: "age3660", fill: "var(--color-age3660)" },
  { name: "60+", min: 60, max: 150, dataKey: "age60plus", fill: "var(--color-age60plus)" }
];

// Helper function to convert Excel date to JS date
const excelDateToJSDate = (excelDate: number) => {
  return new Date((excelDate - 25569) * 86400 * 1000)
}

const PieChartComponent = ({
  dateRange,
  ageGroup,
}: {
  dateRange: DateRange | undefined
  ageGroup: string
}) => {
  // Process data for pie chart
  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const crimeData = data as CrimeReport[];
    
    // Filter data based on date range only (not by age group since we're showing age distribution)
    const filteredData = crimeData.filter(crime => {
      const crimeDate = excelDateToJSDate(crime.case_date);
      return crimeDate >= dateRange.from && crimeDate <= dateRange.to;
    });

    // Initialize age group counts
    const ageCounts = ageRanges.map(range => ({
      name: range.name,
      value: 0,
      fill: range.fill
    }));

    // Count by age group
    filteredData.forEach(crime => {
      const age = crime.age;
      const ageRangeIndex = ageRanges.findIndex(
        range => age >= range.min && age <= range.max
      );
      
      if (ageRangeIndex !== -1) {
        ageCounts[ageRangeIndex].value++;
      }
    });

    return ageCounts;
  }, [dateRange]);

  // Generate a descriptive summary
  const generateSummary = () => {
    if (chartData.length === 0) return "No data available for the selected filters";

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const topAgeGroup = [...chartData].sort((a, b) => b.value - a.value)[0];
    
    return `${topAgeGroup.name} age group represents ${Math.round(topAgeGroup.value / total * 100)}% of all offenders`;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Age Group Distribution</CardTitle>
        <CardDescription>
          {dateRange?.from && dateRange?.to 
            ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
            : "All dates"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie 
              data={chartData} 
              dataKey="value" 
              nameKey="name" 
              label={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ageRanges[index].fill} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {generateSummary()}
        </div>
        <div className="leading-none text-muted-foreground">
          Based on age distribution of offenders
        </div>
      </CardFooter>
    </Card>
  )
}

export default PieChartComponent