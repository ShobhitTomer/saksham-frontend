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
  latitude?: number;
  longitude?: number;
}

interface DistrictAgeChartProps {
  data: DataItem[];
}

const DistrictAgeChart: React.FC<DistrictAgeChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Define age groups
  const ageGroups = [
    { name: "0-18", min: 0, max: 18 },
    { name: "19-35", min: 19, max: 35 },
    { name: "36-60", min: 36, max: 60 },
    { name: "60+", min: 60, max: 120 }
  ];

  // Process data to get districts
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

    // Initialize age group counts
    const ageGroupCounts = ageGroups.map(group => ({
      name: group.name,
      count: 0,
      male: 0,
      female: 0
    }));

    // Count by age group and gender
    districtData.forEach(item => {
      const age = item.age;
      const gender = item.Gender;
      
      // Find the appropriate age group
      const ageGroupIndex = ageGroups.findIndex(
        group => age >= group.min && age <= group.max
      );
      
      if (ageGroupIndex !== -1) {
        ageGroupCounts[ageGroupIndex].count++;
        
        if (gender === "Male") {
          ageGroupCounts[ageGroupIndex].male++;
        } else if (gender === "Female") {
          ageGroupCounts[ageGroupIndex].female++;
        }
      }
    });

    setChartData(ageGroupCounts);
  }, [selectedDistrict, data]);

  // Colors for bars
  const colors = {
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
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="font-medium">Age Group: {data.name}</p>
                        <p>Total: {data.count}</p>
                        <p>Male: {data.male}</p>
                        <p>Female: {data.female}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="male" name="Male" fill={colors.male} stackId="a" />
              <Bar dataKey="female" name="Female" fill={colors.female} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DistrictAgeChart;