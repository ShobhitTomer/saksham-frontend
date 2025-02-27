import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DistrictData {
  name: string;
  crimes: number;
  detectionRate: string | number;
  detectedCount?: number;
}

interface DistrictDetectionChartProps {
  data: DistrictData[];
}

const DistrictDetectionChart: React.FC<DistrictDetectionChartProps> = ({ data }) => {
  // Sort data by detection rate
  const sortedData = [...data]
    .map(district => ({
      ...district,
      detectionRate: typeof district.detectionRate === 'string' 
        ? parseFloat(district.detectionRate) 
        : district.detectionRate
    }))
    .sort((a, b) => b.detectionRate - a.detectionRate);

  // Colors based on detection rate ranges
  const getBarColor = (rate: number) => {
    if (rate >= 75) return '#10b981'; // Green
    if (rate >= 60) return '#22c55e'; // Light green
    if (rate >= 50) return '#facc15'; // Yellow
    if (rate >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
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
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis 
          type="number" 
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={80}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === "Detection Rate") {
              return [`${value}%`, name];
            }
            return [value, name];
          }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const district = payload[0].payload;
              return (
                <div className="bg-white p-2 border rounded shadow-sm">
                  <p className="font-medium">{district.name}</p>
                  <p>Detection Rate: {district.detectionRate}%</p>
                  <p>Total Crimes: {district.crimes}</p>
                  <p>Solved Cases: {district.detectedCount || Math.round(district.crimes * district.detectionRate / 100)}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Bar 
          dataKey="detectionRate" 
          name="Detection Rate" 
          radius={[0, 4, 4, 0]}
          barSize={20}
        >
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBarColor(Number(entry.detectionRate))} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DistrictDetectionChart;