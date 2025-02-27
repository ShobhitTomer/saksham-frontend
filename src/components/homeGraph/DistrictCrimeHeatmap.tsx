import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix Leaflet icon issue in React
// This would normally be in a useEffect in a real application
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Types
interface DataItem {
  case_date: number;
  age: number;
  Gender: string;
  Crime_Head: string;
  Category: string;
  fir_no: string;
  "District/City": string;
  IS_DETECTED?: boolean; 
}

interface DistrictSummary {
  name: string;
  crimes: number;
  detectionRate: string | number;
  avgResponseTime: number;
  center?: [number, number]; // Optional center coordinates
}

interface DistrictCrimeHeatmapProps {
  data: DataItem[];
  districts: DistrictSummary[];
}

// Mock district coordinates for India (would be replaced with actual locations in production)
const districtCoordinates = {
  'Badarpur': [28.5029, 77.3020],
  'Saket': [28.5260, 77.2091],
  'Delhi Cantt': [28.5926, 77.1376],
  'Vasant Vihar': [28.5610, 77.1573],
  'Mehrauli': [28.5167, 77.1833],
  'Paschim Vihar': [28.6654, 77.1019],
  'Punjabi Bagh': [28.6711, 77.1322],
  'Rohini': [28.7410, 77.1180],
  'Alipur': [28.8132, 77.1533],
  'Model Town': [28.7158, 77.1917],
  'Timarpur': [28.7128, 77.2233],
  'Mayur Vihar': [28.6073, 77.2937],
  'Lajpat Nagar': [28.5678, 77.2432],
  'Vasant Kunj': [28.5246, 77.1567],
  'Dwarka': [28.5921, 77.0460],
  // Add coordinates for other districts as needed
};

// Heat layer initialization component
const HeatLayer = ({ points }: { points: Array<[number, number, number]> }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!points.length) return;
    
    // Create heat layer and add to map
    const heat = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
    });
    
    heat.addTo(map);
    
    // Cleanup on unmount
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);
  
  return null;
};

// Filter control component
const FilterControl = ({ 
  onFilterChange, 
  filters 
}: { 
  onFilterChange: (filters: { [key: string]: boolean }) => void,
  filters: { [key: string]: boolean }
}) => {
  return (
    <div className="bg-white p-3 rounded shadow-md absolute top-2 right-2 z-10 text-sm">
      <h4 className="font-medium mb-2">Filters</h4>
      <div className="space-y-1">
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={filters.detected}
            onChange={(e) => onFilterChange({ ...filters, detected: e.target.checked })}
            className="rounded"
          />
          <span>Detected Cases</span>
        </label>
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={filters.undetected}
            onChange={(e) => onFilterChange({ ...filters, undetected: e.target.checked })}
            className="rounded"
          />
          <span>Undetected Cases</span>
        </label>
      </div>
    </div>
  );
};

const DistrictCrimeHeatmap: React.FC<DistrictCrimeHeatmapProps> = ({ data, districts }) => {
  const [heatmapPoints, setHeatmapPoints] = useState<Array<[number, number, number]>>([]);
  const [filters, setFilters] = useState({
    detected: true,
    undetected: true
  });
  const [districtData, setDistrictData] = useState<DistrictSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Process data for heatmap and district markers
  useEffect(() => {
    setLoading(true);
    
    // Process district data with coordinates
    const processedDistricts = districts.map(district => {
      const districtName = district.name;
      // Try to get coordinates, default to Delhi center if not found
      const coords = districtCoordinates[districtName] || [28.6139, 77.2090];
      
      return {
        ...district,
        center: coords as [number, number]
      };
    });
    
    // Generate heatmap points based on districts
    // In a real app, you would use actual crime locations
    const points: Array<[number, number, number]> = [];
    
    // For each district, create points based on crime count
    processedDistricts.forEach(district => {
      if (!district.center) return;
      
      // Create intensity based on crime count
      const intensity = district.crimes / 100; // Normalize intensity
      
      // Add a point at district center
      points.push([
        district.center[0], 
        district.center[1], 
        intensity > 1 ? 1 : intensity
      ]);
      
      // Spread some points around district center
      const crimeCount = Math.min(district.crimes, 20); // Cap to prevent too many points
      
      for (let i = 0; i < crimeCount; i++) {
        // Random offset within 0.01 degrees (roughly 1km)
        const latOffset = (Math.random() - 0.5) * 0.02;
        const lngOffset = (Math.random() - 0.5) * 0.02;
        
        points.push([
          district.center[0] + latOffset,
          district.center[1] + lngOffset,
          Math.random() * intensity * 0.8 // Varied intensity
        ]);
      }
    });
    
    setDistrictData(processedDistricts);
    setHeatmapPoints(points);
    setLoading(false);
  }, [data, districts]);

  // Apply filters if needed
  useEffect(() => {
    // In a real app, you would filter points based on detection status
    // For now, we're just using all points
  }, [filters]);

  // Get color based on detection rate
  const getDetectionRateColor = (rate: number | string) => {
    const rateNumber = typeof rate === 'string' ? parseFloat(rate) : rate;
    
    if (rateNumber >= 75) return '#10b981'; // Green
    if (rateNumber >= 65) return '#22c55e'; // Light green
    if (rateNumber >= 55) return '#facc15'; // Yellow
    if (rateNumber >= 45) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={[28.6139, 77.2090]} // Delhi center coordinates
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Heat layer for crime intensity */}
        <HeatLayer points={heatmapPoints} />
        
        {/* District markers */}
        {districtData.map((district, idx) => {
          if (!district.center) return null;
          
          return (
            <React.Fragment key={idx}>
              {/* District circle with color based on detection rate */}
              <Circle
                center={district.center}
                radius={1500}
                pathOptions={{
                  color: getDetectionRateColor(district.detectionRate),
                  fillColor: getDetectionRateColor(district.detectionRate),
                  fillOpacity: 0.3
                }}
              />
              
              {/* District marker */}
              <Marker position={district.center}>
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold">{district.name}</h3>
                    <p className="text-sm">Total Crimes: {district.crimes}</p>
                    <p className="text-sm">Detection Rate: {district.detectionRate}%</p>
                    <p className="text-sm">Avg Response: {district.avgResponseTime} min</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
        
        {/* Filter control */}
        <FilterControl onFilterChange={setFilters} filters={filters} />
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow-md z-10 text-xs">
        <h4 className="font-medium mb-1">Detection Rate</h4>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
          <span>&lt;45%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
          <span>45-55%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
          <span>55-65%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>
          <span>65-75%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-600"></span>
          <span>&gt;75%</span>
        </div>
      </div>
    </div>
  );
};

export default DistrictCrimeHeatmap;