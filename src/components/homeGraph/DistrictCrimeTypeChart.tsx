import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DataItem {
  case_date: number;
  age: number;
  Gender: string;
  Crime_Head: string;
  Category: string;
  fir_no: string;
  "District/City": string;
  "IS_DETECTED (Yes/No)": string;
  latitude: number;
  longitude: number;
}

interface DistrictCrimeTypeChartProps {
  data: DataItem[];
}

const DistrictCrimeTypeChart: React.FC<DistrictCrimeTypeChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Process data to get districts and crime types
  useEffect(() => {
    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    // Get unique districts
    const uniqueDistricts = Array.from(new Set(data.map(item => item["District/City"])));
    setDistricts(uniqueDistricts);

    // Set first district as default if none selected
    if (!selectedDistrict && uniqueDistricts.length > 0) {
      setSelectedDistrict(uniqueDistricts[0]);
    }

    setLoading(false);
  }, [data]);

  // Process data for selected district
  useEffect(() => {
    if (!selectedDistrict || !data || data.length === 0) return;

    // Filter data for the selected district
    const districtData = data.filter(item => item["District/City"] === selectedDistrict);

    // Count crime types
    const crimeTypeCounts = {};
    districtData.forEach(item => {
      const crimeType = item.Crime_Head;
      if (!crimeTypeCounts[crimeType]) {
        crimeTypeCounts[crimeType] = {
          name: crimeType,
          count: 0,
          detected: 0
        };
      }
      crimeTypeCounts[crimeType].count++;
      if (item.IS_DETECTED) {
        crimeTypeCounts[crimeType].detected++;
      }
    });

    // Calculate detection rates and prepare chart data
    const chartData = Object.values(crimeTypeCounts)
      .map((crime: any) => ({
        ...crime,
        detectionRate: crime.count > 0 ? (crime.detected / crime.count * 100).toFixed(1) : 0
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 8); // Take top 8 for better visualization

    setChartData(chartData);
  }, [selectedDistrict, data]);

  // Colors for crime types
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884D8', '#82CA9D', '#FF6E76', '#A0522D'
  ];

  // If there's no data or empty data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Truncate long crime type names for display
  const formatCrimeType = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 17) + '...';
    }
    return name;
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* District selector */}
      <div className="mb-4 flex justify-center">
        <select 
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedDistrict || ''}
          onChange={(e) => setSelectedDistrict(e.target.value)}
        >
          {districts.map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
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
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tickFormatter={formatCrimeType}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => {
                  if (name === "Detection Rate") return [`${value}%`, name];
                  return [value, name];
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="font-medium">{data.name}</p>
                        <p>Count: {data.count}</p>
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
                dataKey="count" 
                name="Crime Count" 
                fill="#0284c7"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DistrictCrimeTypeChart;