import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface CrimeTrendsChartProps {
  data: DataItem[];
}

const CrimeTrendsChart: React.FC<CrimeTrendsChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Process data for monthly trend analysis
  useEffect(() => {
    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    // Get unique crime categories
    const crimeCategories = Array.from(new Set(data.map(item => item.Category)));
    
    // Group data by month and category
    const monthlyData = {};
    
    data.forEach(item => {
      const date = convertExcelDateToJS(item.case_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const category = item.Category;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          total: 0,
          detected: 0,
          monthName: date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear()
        };
        
        // Initialize all categories with 0
        crimeCategories.forEach(cat => {
          monthlyData[monthKey][cat] = 0;
        });
      }
      
      monthlyData[monthKey][category]++;
      monthlyData[monthKey].total++;
      
      if (item["IS_DETECTED (Yes/No)"] === "Detected") {
        monthlyData[monthKey].detected++;
      }
    });
    
    // Convert to array and sort by month
    const monthlyArray = Object.values(monthlyData)
      .sort((a: any, b: any) => a.month.localeCompare(b.month));
    
    setChartData(monthlyArray);
    setLoading(false);
  }, [data]);

  // Colors for each line
  const lineColors = {
    total: "#0284c7",
    detected: "#10b981",
    Vehical: "#f97316",
    Mobile: "#8b5cf6",
    Other: "#f43f5e"
  };

  // If there's no data or empty data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="monthName" 
              angle={-45} 
              textAnchor="end" 
              height={80}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                return [value, name === "detected" ? "Detected Cases" : 
                               name === "total" ? "Total Cases" : name];
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              name="Total Cases" 
              stroke={lineColors.total} 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="detected" 
              name="Detected Cases" 
              stroke={lineColors.detected} 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="Vehical" 
              name="Vehicle Theft" 
              stroke={lineColors.Vehical} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="Mobile" 
              name="Mobile Theft" 
              stroke={lineColors.Mobile} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CrimeTrendsChart;