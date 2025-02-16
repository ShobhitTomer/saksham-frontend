import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import the crime data JSON
import crimeData from "@/data/data.json";

const HeatmapWithFilters = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined, // No start date initially
    to: undefined, // No end date initially
  });
  const [ageGroup, setAgeGroup] = useState<string>("All");
  const [filteredData, setFilteredData] = useState(crimeData);

  useEffect(() => {
    // Apply filters whenever the filter state changes
    const newFilteredData = crimeData.filter((crime: any) => {
      const crimeDate = new Date(crime.case_date);

      // Check if the crime date falls within the selected date range
      const isDateInRange =
        (!dateRange?.from || crimeDate >= dateRange.from) &&
        (!dateRange?.to || crimeDate <= dateRange.to);

      // Check if the age group matches or "All" is selected
      const isAgeGroupMatch = ageGroup === "All" || crime.age_group === ageGroup;

      return isDateInRange && isAgeGroupMatch;
    });

    setFilteredData(newFilteredData);
  }, [dateRange, ageGroup]);

  // Utility function to get a color based on the crime category
  const getColor = (crimeCategory: string) => {
    switch (crimeCategory) {
      case "Vehical":
        return "red";
      case "Mobile":
        return "blue";
      default:
        return "orange";
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-center mb-8">Heatmap</h1>

      {/* Filters Section */}
      <div
        className="flex flex-wrap justify-center items-center gap-4 mb-4 p-4 bg-white rounded-lg shadow-md"
        style={{ zIndex: 1000, position: "relative" }}
      >
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
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
              selected={dateRange}
              onSelect={setDateRange}
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

      {/* Heatmap */}
      <div className="relative w-full h-[500px]">
        <MapContainer
          center={[21.19198, 72.77905]}
          zoom={6}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filteredData.map((crime: any, index: number) => (
            <Marker
              key={index}
              position={[crime.latitude, crime.longitude]}
              icon={
                new L.DivIcon({
                  className: "custom-marker",
                  html: `<div style="background-color: ${getColor(
                    crime.Category
                  )}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                })
              }
            >
              <Tooltip>
                <div>
                  <strong>FIR no:</strong> {crime.fir_no}
                  <br />
                  <strong>Location:</strong> {crime.loc_name}
                  <br />
                  <strong>Crime:</strong> {crime.Crime_Head}
                  <br />
                  <strong>Category:</strong> {crime.Category}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default HeatmapWithFilters;
