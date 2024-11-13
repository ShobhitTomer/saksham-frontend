"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dataJson from "../data/data.json"
import { format, parseISO } from "date-fns"

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

export const ReportGenerator: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<{ startDate: Date | null; endDate: Date | null }>({ startDate: null, endDate: null })
  const [ageRange, setAgeRange] = React.useState<[number, number]>([0, 100])
  const [crimeType, setCrimeType] = React.useState<string | null>(null)
  const [genderType, setGenderType] = React.useState<string | null>(null)
  const [category, setCategory] = React.useState<string | null>(null)
  const [reportData, setReportData] = React.useState<DataItem[]>([])

  const crimeTypeOptions = [
    { value: "Theft (IPC 379/380)", label: "Theft" },
    { value: "assault", label: "Assault" },
    { value: "robbery", label: "Robbery" },
    {value: "burglary", label: "Burglary"},
  ]

  const genderTypeOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" }
  ]

  const categoryOptions = [
    { value: "Vehical", label: "Vehical" },
    { value: "Mobile", label: "Mobile" },
  ]

  const data: DataItem[] = dataJson as DataItem[]

  const handleGenerateReport = () => {
    const filteredData = data.filter((item) => {
      const caseDate = new Date((item.case_date - 25569) * 86400 * 1000)
      const isWithinDateRange = dateRange.startDate && dateRange.endDate
        ? caseDate >= dateRange.startDate && caseDate <= dateRange.endDate
        : true
      const isWithinAgeRange = item.age >= ageRange[0] && item.age <= ageRange[1]
      const matchesCrimeType = !crimeType || item.Crime_Head.toLowerCase().split(" ")[0] === crimeType
      console.log(item.Crime_Head.toLowerCase().split(" ")[0])
      const matchesCategory = !category || item.Category.toLowerCase() === category.toLowerCase()
      const matchesGender = !genderType || item.Gender.toLowerCase() === genderType.toLowerCase()

      return isWithinDateRange && isWithinAgeRange && matchesCrimeType && matchesCategory && matchesGender
    })
    setReportData(filteredData)
  }

  return (
    <div className="container mx-auto py-8">
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
            <div>
              <Label>Crime Type</Label>
              <Combobox options={crimeTypeOptions} placeholder="Select Crime Type" selectedValue={crimeType} onValueChange={setCrimeType} />
            </div>
            <div>
              <Label>Gender</Label>
              <Combobox options={genderTypeOptions} placeholder="Select Gender" selectedValue={genderType} onValueChange={setGenderType} />
            </div>
            <div>
              <Label>Category</Label>
              <Combobox options={categoryOptions} placeholder="Select Category" selectedValue={category} onValueChange={setCategory} />
            </div>
          </div>
          <Button onClick={handleGenerateReport} className="mt-6 w-full">Generate Report</Button>
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-4">Total Incidents: {reportData.length}</p>
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
                      <td className="p-2">{format(new Date((item.case_date - 25569) * 86400 * 1000), "MM/dd/yyyy")}</td>
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
      )}
    </div>
  )
}

export default ReportGenerator