import { useState, useEffect, useMemo } from "react";
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
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";


import crimeData from "@/data/data.json";

const excelDateToJSDate = (excelDate: number) => {
  return new Date((excelDate - 25569) * 86400 * 1000);
};

const HeatmapWithFilters = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [ageGroup, setAgeGroup] = useState<string>("All");

  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return crimeData;

    return crimeData.filter((crime: any) => {
      const crimeDate = excelDateToJSDate(crime.case_date);

      const isDateInRange =
        crimeDate >= dateRange.from && crimeDate <= dateRange.to;

      if (ageGroup !== "All") {
        const [minAge, maxAge] = ageGroup.split("-");
        if (maxAge) {
          if (crime.age < parseInt(minAge) || crime.age > parseInt(maxAge)) {
            return false;
          }
        } else if (parseInt(minAge) === 60 && crime.age < 60) {
          return false;
        }
      }

      return isDateInRange;
    });
  }, [dateRange, ageGroup]);

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

  const exportToPDF = async () => {
    const pdf = new jsPDF("portrait", "mm", "a4");

    // Add the heatmap to the PDF
    const mapElement = document.querySelector(".leaflet-container") as HTMLElement;
    if (mapElement) {
      const mapCanvas = await html2canvas(mapElement);
      const mapImage = mapCanvas.toDataURL("image/png");
      pdf.addImage(mapImage, "PNG", 10, 10, 190, 100); // Adjust position and size
    }

    // Add the heading for filtered data
    pdf.text("Filtered Crime Data:", 10, 120);

    // Calculate total crimes per place
    const crimesPerPlace: { [key: string]: number } = {};
    filteredData.forEach((crime: any) => {
      crimesPerPlace[crime.loc_name] = (crimesPerPlace[crime.loc_name] || 0) + 1;
    });

    // Prepare the data for the table
    const placewiseData = Object.entries(crimesPerPlace).map(([place, total]) => [
      place,
      total,
    ]);

    // Add the overall total crimes to the table
    const overallTotalCrimes = filteredData.length;
    placewiseData.push(["Overall Total Crimes", overallTotalCrimes]);

    // Add the placewise summary table
    pdf.autoTable({
      startY: 130,
      head: [["Place", "Total Incidents"]],
      body: placewiseData,
      styles: { fontSize: 10, cellPadding: 3 },
      theme: "grid",
    });

    // Add the detailed table of filtered data
    pdf.autoTable({
      startY: pdf.lastAutoTable.finalY + 10, // Start below the first table
      head: [["FIR No", "Location", "Crime", "Category", "Case Date", "Age Group"]],
      body: filteredData.map((crime: any) => [
        crime.fir_no,
        crime.loc_name,
        crime.Crime_Head,
        crime.Category,
        format(excelDateToJSDate(crime.case_date), "dd/MM/yyyy"),
        crime.age_group,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      theme: "grid",
    });

    // Save the PDF
    pdf.save("Filtered_Heatmap_Report.pdf");
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

      {/* Export & Legend Section */}
      <div className="flex justify-between items-center mb-4">
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Vehicle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Mobile</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Other</span>
          </div>
        </div>

        {/* Export Button */}
        <Button onClick={exportToPDF} className="bg-green-500 text-white">
          Export Heatmap as PDF
        </Button>
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
