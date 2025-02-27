import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CrimeType {
  type: string;
  count: number;
  detectedCount: number;
  detectionRate: string | number;
}

interface DetectionRateProps {
  data: CrimeType[];
}

const DetectionRateByTypeChart: React.FC<DetectionRateProps> = ({ data }) => {
  // Sort data by count in descending order and take top 8 for better visualization
  const sortedData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(item => ({
      ...item,
      detectionRate: typeof item.detectionRate === 'string' ? parseFloat(item.detectionRate) : item.detectionRate
    }));

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

  // Truncate long crime type names
  const formatCrimeType = (type: string) => {
    if (type.length > 15) {
      return `${type.substring(0, 12)}...`;
    }
    return type;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="type" 
          angle={-45} 
          textAnchor="end" 
          height={80} 
          tickFormatter={formatCrimeType}
        />
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          stroke="#666" 
          domain={[0, 'dataMax']} 
          tickFormatter={(value) => `${value}`} 
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="#0284c7" 
          domain={[0, 100]} 
          tickFormatter={(value) => `${value}%`} 
        />
        
        {/* Number of cases bar */}
        <Bar 
          yAxisId="left" 
          dataKey="count" 
          fill="#64748b" 
          name="Number of Cases"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        
        {/* Detection rate bar */}
        <Bar 
          yAxisId="right" 
          dataKey="detectionRate" 
          name="Detection Rate (%)" 
          radius={[4, 4, 0, 0]}
          barSize={30}
        >
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBarColor(Number(entry.detectionRate))} 
            />
          ))}
        </Bar>
        
        <Tooltip
          formatter={(value, name) => {
            if (name === "Detection Rate (%)") {
              return [`${value}%`, name];
            }
            return [value, name];
          }}
        />
        <Legend />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DetectionRateByTypeChart;