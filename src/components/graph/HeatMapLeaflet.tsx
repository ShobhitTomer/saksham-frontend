"use client"

import { useMemo } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import * as L from "leaflet"
import "leaflet.heat"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import data from "../../data/data.json"
import { CrimeReport } from "@/types/type"
import { DateRange } from "react-day-picker"

const excelDateToJSDate = (excelDate: number) => {
  return new Date((excelDate - 25569) * 86400 * 1000)
}

const HeatmapLayer = ({ data }: { data: CrimeReport[] }) => {
  const map = useMap()

  useMemo(() => {
    map.eachLayer((layer) => {
      if ((layer as any)._heat) {
        map.removeLayer(layer)
      }
    })

    if (data.length) {
      const heatLayer = L.heatLayer(
        data.map((crime) => [crime.latitude, crime.longitude, 1]),
        { radius: 25, blur: 15, maxZoom: 17 }
      )
      heatLayer.addTo(map)
    }
  }, [data, map])

  return null
}

export default function HeatmapComponent({
  dateRange,
  ageGroup,
}: {
  dateRange: DateRange | undefined
  ageGroup: string
}) {
  const crimeData = Object.values(data) as CrimeReport[]

  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []

    return crimeData.filter((crime) => {
      const crimeDate = excelDateToJSDate(crime.case_date)
      if (crimeDate < dateRange.from || crimeDate > dateRange.to) {
        return false
      }

      if (ageGroup !== "All") {
        const [minAge, maxAge] = ageGroup.split("-")
        if (maxAge) {
          if (crime.age < parseInt(minAge) || crime.age > parseInt(maxAge)) {
            return false
          }
        } else if (parseInt(minAge) === 60 && crime.age < 60) {
          return false
        }
      }

      return true
    })
  }, [dateRange, ageGroup])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crime Data Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative z-0">
          <MapContainer
            center={[22.2587, 71.1924]}
            zoom={7}
            style={{ height: "600px", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap'
            />
            <HeatmapLayer data={filteredData} />
          </MapContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing Crime Data from{" "}
          {dateRange?.from ? format(dateRange.from, "MMMM yyyy") : ""} to{" "}
          {dateRange?.to ? format(dateRange.to, "MMMM yyyy") : ""} for age group{" "}
          {ageGroup}
        </div>
      </CardFooter>
    </Card>
  )
}