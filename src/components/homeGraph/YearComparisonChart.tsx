import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataItem {
  case_date: number;
  age: number;
  Gender: string;
  Crime_Head: string;
  Category: string;
  fir_no: string;
  "District/City": string;
  "IS_DETECTED (Yes/No)": string;
  latitude?: number;
  longitude?: number;
}

interface YearComparisonChartProps {
  data: DataItem[];
}

const YearComparisonChart: React.FC<YearComparisonChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'category' | 'gender' | 'detection'>('category');

  // Helper function to convert Excel date to JS date
  const convertExcelDateToJS = (excelDate: number) => {
    try {
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      return new Date((excelDate - 25569) * millisecondsPerDay);
    } catch (error) {
      console.error('Error converting date:', error);
      return new Date(); // Return current date as fallback
    }
  };

  // Process data for year-wise comparison
  useEffect(() => {
    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    // Get unique years from data
    const years = new Set<number>();
    data.forEach(item => {
      const date = convertExcelDateToJS(item.case_date);
      years.add(date.getFullYear());
    });

    // Sort years in ascending order
    const sortedYears = Array.from(years).sort();

    // Initialize data structure for each year
    const yearlyData = sortedYears.map(year => ({
      year: year.toString(),
      total: 0,
      detected: 0,
      undetected: 0,
      Vehical: 0,
      Mobile: 0,
      Other: 0,
      male: 0,
      female: 0
    }));

    // Aggregate data by year
    data.forEach(item => {
      const date = convertExcelDateToJS(item.case_date);
      const year = date.getFullYear();
      const yearIndex = sortedYears.indexOf(year);

      if (yearIndex !== -1) {
        // Increment total count
        yearlyData[yearIndex].total++;

        // Count by detection status
        if (item["IS_DETECTED (Yes/No)"] === "Detected") {
          yearlyData[yearIndex].detected++;
        } else {
          yearlyData[yearIndex].undetected++;
        }

        // Count by category
        const category = item.Category || "Other";
        if (yearlyData[yearIndex][category] !== undefined) {
          yearlyData[yearIndex][category]++;
        } else {
          yearlyData[yearIndex].Other++;
        }

        // Count by gender
        if (item.Gender === "Male") {
          yearlyData[yearIndex].male++;
        } else if (item.Gender === "Female") {
          yearlyData[yearIndex].female++;
        }
      }
    });

    // Calculate detection rate
    yearlyData.forEach(yearData => {
      yearData.detectionRate = yearData.total > 0 
        ? (yearData.detected / yearData.total * 100).toFixed(1)
        : 0;
    });

    setChartData(yearlyData);
    setLoading(false);
  }, [data]);

  // Define bar colors
  const barColors = {
    detected: "#10b981",
    undetected: "#ef4444",
    Vehical: "#0284c7",
    Mobile: "#8b5cf6",
    Other: "#f97316",
    male: "#0284c7",
    female: "#d946ef"
  };

  // If there's no data or empty data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Render different bars based on the view
  const renderBars = () => {
    switch (view) {
      case 'category':
        return (
          <>
            <Bar dataKey="Vehical" name="Vehicle Theft" stackId="a" fill={barColors.Vehical} />
            <Bar dataKey="Mobile" name="Mobile Theft" stackId="a" fill={barColors.Mobile} />
            <Bar dataKey="Other" name="Other Theft" stackId="a" fill={barColors.Other} />
          </>
        );
      case 'gender':
        return (
          <>
            <Bar dataKey="male" name="Male" stackId="a" fill={barColors.male} />
            <Bar dataKey="female" name="Female" stackId="a" fill={barColors.female} />
          </>
        );
      case 'detection':
        return (
          <>
            <Bar dataKey="detected" name="Detected" stackId="a" fill={barColors.detected} />
            <Bar dataKey="undetected" name="Undetected" stackId="a" fill={barColors.undetected} />
          </>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* View selector */}
      <div className="mb-4 flex justify-center">
        <div className="flex bg-gray-100 p-1 rounded-md">
          <button
            className={`px-3 py-1 rounded ${view === 'category' ? 'bg-white shadow' : ''}`}
            onClick={() => setView('category')}
          >
            By Category
          </button>
          <button
            className={`px-3 py-1 rounded ${view === 'gender' ? 'bg-white shadow' : ''}`}
            onClick={() => setView('gender')}
          >
            By Gender
          </button>
          <button
            className={`px-3 py-1 rounded ${view === 'detection' ? 'bg-white shadow' : ''}`}
            onClick={() => setView('detection')}
          >
            By Detection
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "detectionRate") return [`${value}%`, "Detection Rate"];
                  return [value, name];
                }}
              />
              <Legend />
              {renderBars()}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default YearComparisonChart;