import { useState, useEffect } from "react"
import BarChartComponent from "@/components/graph/BarChartComponent"
import HeatmapComponent from "@/components/graph/HeatMapLeaflet"
import LineChartComponent from "@/components/graph/LineChartComponent"
import PieChartComponent from "@/components/graph/PieChartComponent"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ArrowUpIcon, ArrowDownIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dataJson from "../data/data.json"

// Import charts from home-components
import DetectionRateByTypeChart from "../components/homeGraph/DetectionRateByTypeChart"
import DistrictDetectionChart from "../components/homeGraph/DistrictDetectionChart"
import DistrictCrimeHeatmap from "../components/homeGraph/DistrictCrimeHeatmap"
import DistrictCrimeTypeChart from "../components/homeGraph/DistrictCrimeTypeChart"
import DistrictAgeChart from "../components/homeGraph/DistrictAgeChart"
import CrimeTrendsChart from "../components/homeGraph/CrimeTrendsChart"
import SeasonalPatternChart from "../components/homeGraph/SeasonalPatternChart"
import YearComparisonChart from "../components/homeGraph/YearComparisonChart"

// Type for the data coming from data.json
interface DataItem {
  case_date: number;
  age: number;
  Gender: string;
  Crime_Head: string;
  Category: string;
  fir_no: string;
  "District/City": string;
  "IS_DETECTED (Yes/No)": string; // Has values "Detected" or "Undetected"
  latitude?: number;
  longitude?: number;
}

// Helper function to convert Excel date to JS date (same as in ReportGenerator)
const convertExcelDateToJS = (excelDate: number) => {
  try {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return new Date((excelDate - 25569) * millisecondsPerDay);
  } catch (error) {
    console.error('Error converting date:', error);
    return new Date(); // Return current date as fallback
  }
};

const CrimeDashboard = () => {
  const [date, setDate] = useState<DateRange | undefined>({ from: new Date(2021, 0, 1), to: new Date(2024, 11, 31) })
  const [ageGroup, setAgeGroup] = useState<string>("All")
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [crimeStats, setCrimeStats] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Process data from data.json based on filters
  useEffect(() => {
    setLoading(true);
    
    // Process data when filters change
    setTimeout(() => {
      // Cast data to the correct type
      const data: DataItem[] = dataJson as DataItem[];
      
      // Filter data based on date range and age group
      const filteredData = data.filter(item => {
        // Convert Excel date to JS date
        const itemDate = convertExcelDateToJS(item.case_date);
        
        // Check if date is within range
        const dateInRange = !date?.from || !date?.to || 
          (itemDate >= date.from && itemDate <= date.to);
        
        // Check if age is within selected group
        let ageInGroup = true;
        if (ageGroup !== "All") {
          const [min, max] = ageGroup.split("-").map(Number);
          if (!isNaN(min) && !isNaN(max)) {
            ageInGroup = item.age >= min && item.age <= max;
          } else if (ageGroup === "60+") {
            ageInGroup = item.age >= 60;
          }
        }
        
        return dateInRange && ageInGroup;
      });
      
      // Process crime types
      const crimeTypes = {};
      filteredData.forEach(item => {
        const crimeType = item.Crime_Head;
        if (!crimeTypes[crimeType]) {
          crimeTypes[crimeType] = { 
            type: crimeType, 
            count: 0, 
            detectedCount: 0 
          };
        }
        crimeTypes[crimeType].count++;
        if (item["IS_DETECTED (Yes/No)"] === "Detected") {
          crimeTypes[crimeType].detectedCount++;
        }
      });
      
      // Calculate detection rates for each crime type
      const crimeTypesArray = Object.values(crimeTypes).map((crime: any) => ({
        ...crime,
        detectionRate: crime.count > 0 
          ? (crime.detectedCount / crime.count * 100).toFixed(1) 
          : 0
      }));
      
      // Process districts
      const districts = {};
      filteredData.forEach(item => {
        const district = item["District/City"];
        if (!districts[district]) {
          districts[district] = { 
            name: district, 
            crimes: 0, 
            detectedCount: 0
          };
        }
        districts[district].crimes++;
        if (item["IS_DETECTED (Yes/No)"] === "Detected") {
          districts[district].detectedCount++;
        }
      });
      
      // Calculate detection rates for each district
      const districtsArray = Object.values(districts).map((district: any) => ({
        ...district,
        detectionRate: district.crimes > 0 
          ? (district.detectedCount / district.crimes * 100).toFixed(1) 
          : 0
      }));
      
      // Overall detection rate
      const totalCrimes = filteredData.length;
      const detectedCrimes = filteredData.filter(item => item["IS_DETECTED (Yes/No)"] === "Detected").length;
      const overallDetectionRate = totalCrimes > 0 
        ? (detectedCrimes / totalCrimes * 100).toFixed(1) 
        : 0;
      
      // Set processed stats
      setCrimeStats({
        totalCrimes,
        detectionRate: overallDetectionRate,
        crimeTypes: crimeTypesArray,
        districts: districtsArray,
        rawData: filteredData
      });
      
      setLoading(false);
    }, 500);
  }, [date, ageGroup]);

  // Most common crime type
  const mostCommonCrime = crimeStats?.crimeTypes.reduce((prev, current) => 
    (prev.count > current.count) ? prev : current, { count: 0 });
  
  // Find districts with highest and lowest detection rates
  const highestDetectionDistrict = crimeStats?.districts.reduce((prev, current) => {
    const prevRate = parseFloat(prev.detectionRate);
    const currentRate = parseFloat(current.detectionRate);
    return (prevRate > currentRate) ? prev : current;
  }, { detectionRate: "0" });
  
  const lowestDetectionDistrict = crimeStats?.districts.reduce((prev, current) => {
    const prevRate = parseFloat(prev.detectionRate);
    const currentRate = parseFloat(current.detectionRate);
    return (prevRate < currentRate) ? prev : current;
  }, { detectionRate: "100" });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold text-center mb-4">Saksham Crime Analytics</h1>
      <p className="text-center text-muted-foreground mb-8">Comprehensive crime statistics and analysis dashboard</p>

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Crimes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Crimes</CardTitle>
                <CardDescription>Reported incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-3xl font-bold">{crimeStats?.totalCrimes.toLocaleString()}</p>
                  <AlertCircleIcon className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            {/* Detection Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Detection Rate</CardTitle>
                <CardDescription>Case resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-3xl font-bold">{crimeStats?.detectionRate}%</p>
                  <CheckCircleIcon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Most Common Crime */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Most Common Crime</CardTitle>
                <CardDescription>Highest frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold">{mostCommonCrime?.type || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">{mostCommonCrime?.count || 0} incidents</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* District Comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">District Analysis</CardTitle>
                <CardDescription>Detection extremes</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium">Highest</p>
                    </div>
                    <p className="text-lg font-bold">{highestDetectionDistrict?.name || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">{highestDetectionDistrict?.detectionRate || 0}%</p>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <ArrowDownIcon className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium">Lowest</p>
                    </div>
                    <p className="text-lg font-bold">{lowestDetectionDistrict?.name || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">{lowestDetectionDistrict?.detectionRate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs and Charts */}
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detection">Detection Rates</TabsTrigger>
              <TabsTrigger value="district">District Analysis</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <BarChartComponent dateRange={date} ageGroup={ageGroup} />
              <PieChartComponent dateRange={date} ageGroup={ageGroup} />
              <LineChartComponent />
              <HeatmapComponent dateRange={date} ageGroup={ageGroup} />
            </TabsContent>

            <TabsContent value="detection" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Detection Rate by Crime Type</CardTitle>
                  <CardDescription>Percentage of cases solved by category</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <DetectionRateByTypeChart data={crimeStats?.crimeTypes || []} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>District Detection Comparison</CardTitle>
                  <CardDescription>Detection rates across districts</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <DistrictDetectionChart data={crimeStats?.districts || []} />
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Category-wise Detection Analysis</CardTitle>
                  <CardDescription>Comparison of detection rates by crime category</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <YearComparisonChart data={crimeStats?.rawData || []} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="district" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>District Crime Heatmap</CardTitle>
                  <CardDescription>Geographical distribution of crime incidents</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <DistrictCrimeHeatmap 
                    data={crimeStats?.rawData || []} 
                    districts={crimeStats?.districts || []} 
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Crime Types by District</CardTitle>
                  <CardDescription>Breakdown of crime types per district</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <DistrictCrimeTypeChart data={crimeStats?.rawData || []} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>District Age Distribution</CardTitle>
                  <CardDescription>Age profile of criminals by district</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <DistrictAgeChart data={crimeStats?.rawData || []} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Crime Trends Over Time</CardTitle>
                  <CardDescription>Monthly crime rate analysis</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <CrimeTrendsChart data={crimeStats?.rawData || []} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Patterns</CardTitle>
                  <CardDescription>Crime frequency by month and season</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <SeasonalPatternChart data={crimeStats?.rawData || []} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Year-over-Year Comparison</CardTitle>
                  <CardDescription>Annual crime statistics</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <YearComparisonChart data={crimeStats?.rawData || []} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* District Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>District Performance Analysis</CardTitle>
              <CardDescription>Comprehensive district metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">District</th>
                      <th className="text-right py-3 px-4">Total Crimes</th>
                      <th className="text-right py-3 px-4">Detection Rate</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crimeStats?.districts.map((district, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 font-medium">{district.name}</td>
                        <td className="text-right py-3 px-4">{district.crimes}</td>
                        <td className="text-right py-3 px-4">
                          <span className={`font-medium ${parseFloat(district.detectionRate) >= 70 ? 'text-green-600' : parseFloat(district.detectionRate) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {district.detectionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${parseFloat(district.detectionRate) >= 70 ? 'bg-green-100 text-green-800' : parseFloat(district.detectionRate) >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                            {parseFloat(district.detectionRate) >= 70 ? 'Excellent' : parseFloat(district.detectionRate) >= 60 ? 'Average' : 'Needs Improvement'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default CrimeDashboard