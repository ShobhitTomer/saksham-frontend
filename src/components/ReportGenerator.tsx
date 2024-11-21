"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dataJson from "../data/data.json"
import { format, parseISO } from "date-fns"
import { Pie, PieChart, Label as RechartsLabel, Cell, Tooltip } from "recharts"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label as L, Cell as C } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Tooltip as RechartsTooltip } from 'recharts'

interface DataItem {
  case_date: number
  age: number
  Gender: string
  Crime_Head: string
  Category: string
  fir_no: string
  "District/City": string
}

interface ComboboxProps {
  options: { value: string; label: string }[]
  placeholder: string
  selectedValue: string | null
  onValueChange: (value: string | null) => void
}

const Combobox: React.FC<ComboboxProps> = ({ options, placeholder, selectedValue, onValueChange }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedValue
            ? options.find((option) => option.value === selectedValue)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value === selectedValue ? null : option.value)
                    setOpen(false)
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${selectedValue === option.value ? "opacity-100" : "opacity-0"}`} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-2 shadow-md">
        <p className="text-sm">{`${payload[0].payload.name}: ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

const Charts: React.FC<{ 
  crimeChartData: any[]; 
  categoryData: any[]; 
  genderData: any[]; 
  COLORS: string[]; 
  reportDataLength: number 
}> = ({ crimeChartData, categoryData, genderData, COLORS, reportDataLength }) => {
  const totalGenderCount = genderData.reduce((acc, curr) => acc + curr.value, 0)
  
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Analysis Charts</CardTitle>
        <CardDescription className="text-center">Detailed metrics displayed through interactive charts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Crime-wise Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Crime-wise Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={crimeChartData}
                  dataKey="count"
                  nameKey="crime"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {crimeChartData.map((entry, index) => (
                    <C key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <RechartsLabel
                    position="center"
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {reportDataLength}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Incidents
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
                <Tooltip />
              </PieChart>
            </CardContent>
          </Card>

          {/* Category-wise Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Category-wise Comparison</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <BarChart width={300} height={300} data={categoryData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <Tooltip />
                <Bar dataKey="vehicle" fill="hsl(var(--chart-1))" radius={4} name="Vehicle" />
                <Bar dataKey="mobile" fill="hsl(var(--chart-1))" radius={4} name="Mobile" />
              </BarChart>
            </CardContent>
          </Card>

          {/* Gender-wise Radial Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Gender Comparison</CardTitle>
              <CardDescription className="text-center">Distribution of cases by gender</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="mx-auto aspect-square w-full max-w-[300px]">
                <RadialBarChart
                  width={300}
                  height={300}
                  data={genderData}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={130}
                >
                  <PolarRadiusAxis tick={false} axisLine={false}>
                    <L
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 16}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {totalGenderCount}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 4}
                                className="fill-muted-foreground"
                              >
                                Total Cases
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                  {genderData.map((entry, index) => (
                    <RadialBar
                      key={entry.name}
                      dataKey="value"
                      data={[entry]}
                      startAngle={180}
                      endAngle={0}
                      cornerRadius={5}
                      fill={COLORS[index]}
                      className="stroke-transparent stroke-2"
                    />
                  ))}
                  <RechartsTooltip content={CustomTooltip} />
                </RadialBarChart>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <div className="flex justify-center gap-4">
                {genderData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export const ReportGenerator: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<{ startDate: Date | null; endDate: Date | null }>({ startDate: null, endDate: null })
  const [ageRange, setAgeRange] = React.useState<[number, number]>([0, 100])
  const [genderType, setGenderType] = React.useState<string | null>(null)
  const [category, setCategory] = React.useState<string | null>(null)
  const [district, setDistrict] = React.useState<string | null>(null)
  const [ipc, setIpc] = React.useState<string | null>(null)
  const [reportData, setReportData] = React.useState<DataItem[]>([])
  const reportRef = React.useRef<HTMLDivElement>(null)
  const chartsRef = React.useRef<HTMLDivElement>(null)
  const incidentsRef = React.useRef<HTMLDivElement>(null)

  const convertExcelDateToJS = (excelDate: number) => {
    try {
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      return new Date((excelDate - 25569) * millisecondsPerDay);
    } catch (error) {
      console.error('Error converting date:', error);
      return new Date(); // Return current date as fallback
    }
  }

  const getDateRange = React.useMemo(() => {
    try {
      if (dateRange.startDate && dateRange.endDate) {
        return {
          start: format(dateRange.startDate, "MM/dd/yyyy"),
          end: format(dateRange.endDate, "MM/dd/yyyy")
        }
      }
      
      const validDates = reportData
        .map(item => convertExcelDateToJS(item.case_date))
        .filter(date => !isNaN(date.getTime())); // Filter out invalid dates

      if (validDates.length === 0) {
        return {
          start: format(new Date(), "MM/dd/yyyy"),
          end: format(new Date(), "MM/dd/yyyy")
        }
      }

      const minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));

      return {
        start: format(minDate, "MM/dd/yyyy"),
        end: format(maxDate, "MM/dd/yyyy")
      }
    } catch (error) {
      console.error('Error calculating date range:', error);
      return {
        start: format(new Date(), "MM/dd/yyyy"),
        end: format(new Date(), "MM/dd/yyyy")
      }
    }
  }, [dateRange, reportData]);

  const handleExportPDF = async () => {
    if (!reportRef.current || !chartsRef.current || !incidentsRef.current) return

    const pdf = new jsPDF()
    let currentY = 0

    // Add report summary
    const summaryCanvas = await html2canvas(reportRef.current)
    const summaryImgData = summaryCanvas.toDataURL('image/png')
    const summaryWidth = pdf.internal.pageSize.getWidth()
    const summaryHeight = (summaryCanvas.height * summaryWidth) / summaryCanvas.width
    pdf.addImage(summaryImgData, 'PNG', 0, currentY, summaryWidth, summaryHeight)
    currentY += summaryHeight + 10

    // Add charts
    const chartsCanvas = await html2canvas(chartsRef.current)
    const chartsImgData = chartsCanvas.toDataURL('image/png')
    const chartsWidth = pdf.internal.pageSize.getWidth()
    const chartsHeight = (chartsCanvas.height * chartsWidth) / chartsCanvas.width
    
    if (currentY + chartsHeight > pdf.internal.pageSize.getHeight()) {
      pdf.addPage()
      currentY = 0
    }
    pdf.addImage(chartsImgData, 'PNG', 0, currentY, chartsWidth, chartsHeight)
    
    // Add incidents table
    pdf.addPage()
    pdf.setFontSize(14)
    pdf.text('Incident Details', 14, 15)
    
    const headers = ['Case No', 'District', 'Date', 'Crime Type', 'Category', 'Age']
    let startY = 25
    const rowHeight = 10
    const margin = 14
    
    pdf.setFontSize(10)
    reportData.forEach((item, index) => {
      if (startY > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage()
        startY = 25
      }
      
      const row = [
        item.fir_no,
        item["District/City"],
        format(new Date((item.case_date - 25569) * 86400 * 1000), "MM/dd/yyyy"),
        item.Crime_Head,
        item.Category,
        item.age.toString()
      ]
      
      if (index === 0) {
        pdf.setFont(undefined, 'bold')
        headers.forEach((header, i) => {
          pdf.text(header, margin + (i * 30), startY)
        })
        pdf.setFont(undefined, 'normal')
        startY += rowHeight
      }
      
      row.forEach((cell, i) => {
        pdf.text(cell.toString(), margin + (i * 30), startY)
      })
      startY += rowHeight
    })

    pdf.save('report.pdf')
  }

  const genderTypeOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" }
  ]

  const categoryOptions = [
    { value: "Vehical", label: "Vehical" },
    { value: "Mobile", label: "Mobile" },
  ]

  const districtOptions = Array.from(new Set(dataJson.map((item: DataItem) => item["District/City"]))).map(district => ({ value: district, label: district }))

  const ipcOptions = Array.from(new Set(dataJson.map((item: DataItem) => item.Crime_Head))).map(ipc => ({ value: ipc, label: ipc }))

  const data: DataItem[] = dataJson as DataItem[]

  const handleGenerateReport = () => {
    const filteredData = data.filter((item) => {
      try {
        const caseDate = convertExcelDateToJS(item.case_date);
        const isWithinDateRange = dateRange.startDate && dateRange.endDate
          ? caseDate >= dateRange.startDate && caseDate <= dateRange.endDate
          : true;
        const isWithinAgeRange = item.age >= ageRange[0] && item.age <= ageRange[1]
        const matchesCategory = !category || item.Category.toLowerCase() === category.toLowerCase()
        const matchesGender = !genderType || item.Gender.toLowerCase() === genderType.toLowerCase()
        const matchesDistrict = !district || item["District/City"] === district
        const matchesIpc = !ipc || item.Crime_Head === ipc

        return isWithinDateRange && isWithinAgeRange && matchesCategory && matchesGender && matchesDistrict && matchesIpc;
      } catch (error) {
        console.error('Error processing item:', item, error);
        return false;
      }
    });
    setReportData(filteredData);
  };

  const districtWiseCount = React.useMemo(() => {
    const counts: { [key: string]: number } = {}
    reportData.forEach(item => {
      counts[item["District/City"]] = (counts[item["District/City"]] || 0) + 1
    })
    return counts
  }, [reportData])

  // Add helper function to truncate crime names
  const truncateCrimeName = (crime: string) => {
    const bracketIndex = crime.indexOf('(')
    return bracketIndex > -1 ? crime.slice(0, bracketIndex).trim() : crime
  }

  // Modify crimeWiseCount to use truncated names
  const crimeWiseCount = React.useMemo(() => {
    const counts: { [key: string]: number } = {}
    reportData.forEach(item => {
      const crimeName = truncateCrimeName(item.Crime_Head)
      counts[crimeName] = (counts[crimeName] || 0) + 1
    })
    return counts
  }, [reportData])

  // Add category comparison data
  const categoryData = React.useMemo(() => {
    const monthlyData: { [key: string]: { month: string; vehicle: number; mobile: number } } = {}
    
    reportData.forEach(item => {
      const date = new Date((item.case_date - 25569) * 86400 * 1000)
      const month = date.toLocaleString('default', { month: 'long' })
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, vehicle: 0, mobile: 0 }
      }
      
      if (item.Category.toLowerCase() === 'vehical') {
        monthlyData[month].vehicle++
      } else if (item.Category.toLowerCase() === 'mobile') {
        monthlyData[month].mobile++
      }
    })

    return Object.values(monthlyData)
  }, [reportData])

  // Prepare data for the pie chart
  const crimeChartData = React.useMemo(() => {
    return Object.entries(crimeWiseCount).map(([crime, count]) => ({
      crime,
      count,
    }))
  }, [crimeWiseCount])

  // Define colors for the pie chart slices
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#00FF85', '#4B0082']

  // Compute genderData
  const genderData = React.useMemo(() => {
    const counts = [
      { name: 'Male', value: reportData.filter(item => item.Gender.toLowerCase() === 'male').length },
      { name: 'Female', value: reportData.filter(item => item.Gender.toLowerCase() === 'female').length }
    ]
    return counts
  }, [reportData])

  const formatDate = (excelDate: number) => {
    try {
      const date = convertExcelDateToJS(excelDate);
      return format(date, "MM/dd/yyyy");
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Input Fields (Filters) */}
      <h1 className="text-4xl font-bold mb-8 text-center">Analysis Report Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  placeholder="Start Date"
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value ? parseISO(e.target.value) : null }))}
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value ? parseISO(e.target.value) : null }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Age Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Min Age"
                  value={ageRange[0]}
                  onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
                />
                <Input
                  type="number"
                  placeholder="Max Age"
                  value={ageRange[1]}
                  onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Combobox options={genderTypeOptions} placeholder="Select Gender" selectedValue={genderType} onValueChange={setGenderType} />
              </div>
              <div>
                <Label>Category</Label>
                <Combobox options={categoryOptions} placeholder="Select Category" selectedValue={category} onValueChange={setCategory} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>District</Label>
                <Combobox options={districtOptions} placeholder="Select District" selectedValue={district} onValueChange={setDistrict} />
              </div>
              <div>
                <Label>IPC</Label>
                <Combobox options={ipcOptions} placeholder="Select IPC" selectedValue={ipc} onValueChange={setIpc} />
              </div>
            </div>
          </div>
          <Button onClick={handleGenerateReport} className="mt-6 w-full">Generate Report</Button>
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <>
          {/* Summary Numbers */}
          <div ref={reportRef} className="mt-8 w-full max-w-6xl mx-auto">
            <Card>
              <CardHeader className="relative">
                <CardTitle className="text-center text-4xl font-bold">Report Summary</CardTitle>
                <Button onClick={handleExportPDF} className="absolute top-4 right-4">
                  Export PDF
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold mb-2 text-center">
                  Total Incidents: <span className="font-bold text-red-500">{reportData.length}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  Date Range: {getDateRange.start} - {getDateRange.end}
                </p>
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">District-wise Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.entries(districtWiseCount).map(([district, count]) => (
                          <div key={district} className="flex justify-between border p-2 rounded">
                            <span>{district}</span>
                            <span className="font-bold ">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Crime-wise Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.entries(crimeWiseCount).map(([crime, count]) => (
                          <div key={crime} className="flex justify-between border p-2 rounded">
                            <span>{crime}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div ref={chartsRef} className="mt-8 w-full max-w-6xl mx-auto">
            <Charts 
              crimeChartData={crimeChartData} 
              categoryData={categoryData} 
              genderData={genderData}
              COLORS={COLORS} 
              reportDataLength={reportData.length} 
            />
          </div>

          {/* Incidents List */}
          <div ref={incidentsRef} className="mt-8 w-full max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Case No</th>
                        <th className="p-2 text-left">District</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Crime Type</th>
                        <th className="p-2 text-left">Category</th>
                        <th className="p-2 text-left">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.fir_no}</td>
                          <td className="p-2">{item["District/City"]}</td>
                          <td className="p-2">{formatDate(item.case_date)}</td>
                          <td className="p-2">{item.Crime_Head}</td>
                          <td className="p-2">{item.Category}</td>
                          <td className="p-2">{item.age}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default ReportGenerator