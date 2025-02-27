import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface SeasonalPatternChartProps {
  data: DataItem[];
}

const SeasonalPatternChart: React.FC<SeasonalPatternChartProps> = ({ data }) => {
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

  // Get season based on month
  const getSeason = (month: number): string => {
    if (month >= 2 && month <= 4) return 'Spring'; // Mar-May
    if (month >= 5 && month <= 7) return 'Summer'; // Jun-Aug
    if (month >= 8 && month <= 10) return 'Autumn'; // Sep-Nov
    return 'Winter'; // Dec-Feb
  };

  // Process data for monthly and seasonal patterns
  useEffect(() => {
    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    // Initialize month-wise data structure
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthlyData = months.map(month => ({
      name: month,
      count: 0,
      detected: 0,
      season: getSeason(months.indexOf(month))
    }));
    
    // Count crimes by month
    data.forEach(item => {
      const date = convertExcelDateToJS(item.case_date);
      const monthIndex = date.getMonth();
      
      monthlyData[monthIndex].count++;
      
      if (item["IS_DETECTED (Yes/No)"] === "Detected") {
        monthlyData[monthIndex].detected++;
      }
    });
    
    // Calculate detection rate
    monthlyData.forEach(month => {
      month.detectionRate = month.count > 0 
        ? (month.detected / month.count * 100).toFixed(1)
        : 0;
    });
    
    setChartData(monthlyData);
    setLoading(false);
  }, [data]);

  // Colors for seasons
  const seasonColors = {
    'Winter': '#60a5fa', // Blue
    'Spring': '#a3e635', // Green
    'Summer': '#f97316', // Orange
    'Autumn': '#b45309'  // Brown
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
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value, name, props) => {
                if (name === "detectionRate") return [`${value}%`, "Detection Rate"];
                return [value, name === "count" ? "Crime Count" : name];
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow-sm">
                      <p className="font-medium">{data.name} ({data.season})</p>
                      <p>Crime Count: {data.count}</p>
                      <p>Detected: {data.detected}</p>
                      <p>Detection Rate: {data.detectionRate}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="count" 
              name="Crime Count" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={seasonColors[entry.season]} />
              ))}
            </Bar>
            <Bar 
              yAxisId="right" 
              dataKey="detectionRate" 
              name="Detection Rate" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
      
      {/* Season color legend */}
      <div className="flex justify-center mt-2 gap-4 text-xs">
        {Object.entries(seasonColors).map(([season, color]) => (
          <div key={season} className="flex items-center gap-1">
            <span 
              className="inline-block w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            ></span>
            <span>{season}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonalPatternChart;