'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarIcon } from "lucide-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import "leaflet.heat";
import { format, setYear, setMonth } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import rawData from "../../data/data.json";
import { CrimeReport } from '@/types/type';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const excelDateToJSDate = (excelDate: number) => {
  return new Date((excelDate - 25569) * 86400 * 1000);
};

const CustomDatePicker = ({ date, setDate, label }: { date: Date | undefined, setDate: (date: Date | undefined) => void, label: string }) => {
  // Updated year range from 2021 to 2024
  const years = Array.from({ length: 4 }, (_, i) => 2021 + i);

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
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <div className="p-4 flex flex-col space-y-4">
          <Select
            value={date ? date.getFullYear().toString() : ""}
            onValueChange={(value) => setDate(date ? setYear(date, parseInt(value)) : new Date(parseInt(value), 0, 1))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-50">
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
  );
};

const HeatmapLayer = ({ data }: { data: CrimeReport[] }) => {
  const map = useMap();

  useEffect(() => {
    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.HeatLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new heatmap layer if there's data
    if (data.length) {
      const heatLayer = L.heatLayer(
        data.map((crime) => [crime.latitude, crime.longitude, 1]), // Using latitude/longitude from the crime data
        { radius: 25, blur: 15, maxZoom: 17 }
      );
      heatLayer.addTo(map);
    }
  }, [data, map]);

  return null;
};

export default function HeatmapComponent() {
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date(2021, 0, 1));  // Start from 2021
  const [toDate, setToDate] = useState<Date | undefined>(new Date(2024, 11, 31));    // End at 2024

  const data = Object.values(rawData) as CrimeReport[];

  const filteredData = useMemo(() => {
    if (!fromDate || !toDate) return [];

    return data.filter(crime => {
      const crimeDate = excelDateToJSDate(crime.case_date);
      return crimeDate >= fromDate && crimeDate <= toDate;
    });
  }, [fromDate, toDate, data]);

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Crime Data Heatmap</CardTitle>
              <CardDescription>Select date range to view crime heatmap</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <CustomDatePicker date={fromDate} setDate={setFromDate} label="Select start date" />
            <CustomDatePicker date={toDate} setDate={setToDate} label="Select end date" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative z-0">
          <MapContainer 
            center={[22.2587, 71.1924]}  // Centering on Gujarat's approximate latitude and longitude
            zoom={7}  // Appropriate zoom level for Gujarat
            style={{ height: "600px", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <HeatmapLayer data={filteredData} />
          </MapContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing Crime Data from {fromDate ? format(fromDate, "MMMM yyyy") : ''} to {toDate ? format(toDate, "MMMM yyyy") : ''}
        </div>
      </CardFooter>
    </Card>
  );
}