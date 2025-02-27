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
  "IS_DETECTED (Yes/No)": string; // Has values "Detected" or "Undetected"
  latitude: number;
  longitude: number;
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

// Gujarat district coordinates (approximate centers)
const districtCoordinates = {
  'Surat City': [21.1702, 72.8311],
  'Bharuch': [21.7051, 72.9959],
  'Dahod': [22.8370, 74.2531],
  'Ahmedabad': [23.0225, 72.5714],
  'Rajkot': [22.3039, 70.8022],
  'Vadodara': [22.3072, 73.1812],
  'Bhavnagar': [21.7645, 72.1519],
  'Jamnagar': [22.4707, 70.0577],
  'Gandhinagar': [23.2156, 72.6369],
  'Junagadh': [21.5222, 70.4579],
  'Anand': [22.5645, 72.9289],
  'Navsari': [20.9467, 72.9520],
  'Mehsana': [23.5880, 72.3693],
  'Morbi': [22.8173, 70.8333],
  'Patan': [23.8493, 72.1266],
  // Default center for unknown districts
  'Default': [22.2587, 71.1924] // Center of Gujarat
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
      
      // Find crimes in this district to get average coordinates
      const districtCrimes = data.filter(item => item["District/City"] === districtName);
      
      // Calculate average lat/long (if available)
      let avgLat = 0;
      let avgLng = 0;
      let validCoords = 0;
      
      districtCrimes.forEach(crime => {
        if (crime.latitude && crime.longitude && crime.latitude !== 0 && crime.longitude !== 0) {
          avgLat += crime.latitude;
          avgLng += crime.longitude;
          validCoords++;
        }
      });
      
      // Calculate average or use fallback coordinates
      let coordinates: [number, number];
      if (validCoords > 0) {
        coordinates = [avgLat / validCoords, avgLng / validCoords];
      } else {
        // Try fallback to dictionary or use a central India coordinate
        coordinates = districtCoordinates[districtName] || [22.5726, 72.8777];
      }
      
      return {
        ...district,
        center: coordinates
      };
    });
    
    // Generate heatmap points from actual crime data
    const points: Array<[number, number, number]> = [];
    
    // Use actual crime locations where available
    data.forEach(crime => {
      // Skip if no valid coordinates
      if (!crime.latitude || !crime.longitude || crime.latitude === 0 || crime.longitude === 0) {
        return;
      }
      
      // Base intensity on detection status
      const intensity = crime["IS_DETECTED (Yes/No)"] === "Detected" ? 0.5 : 0.8;
      
      points.push([
        crime.latitude,
        crime.longitude,
        intensity
      ]);
    });
    
    // If we have very few points with coordinates, add some around district centers
    if (points.length < 10) {
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
    }
    
    setDistrictData(processedDistricts);
    setHeatmapPoints(points);
    setLoading(false);
  }, [data, districts]);

  // Apply filters
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Filter points based on detection status
    const filteredPoints: Array<[number, number, number]> = [];
    
    data.forEach(crime => {
      // Skip if no valid coordinates
      if (!crime.latitude || !crime.longitude || crime.latitude === 0 || crime.longitude === 0) {
        return;
      }
      
      const isDetected = crime["IS_DETECTED (Yes/No)"] === "Detected";
      
      // Check if we should include this point based on filters
      if ((isDetected && filters.detected) || (!isDetected && filters.undetected)) {
        // Base intensity on detection status
        const intensity = isDetected ? 0.5 : 0.8;
        
        filteredPoints.push([
          crime.latitude,
          crime.longitude,
          intensity
        ]);
      }
    });
    
    // If we have very few points with coordinates, add some around district centers
    if (filteredPoints.length < 10) {
      districtData.forEach(district => {
        if (!district.center) return;
        
        // Create intensity based on crime count
        const intensity = district.crimes / 100; // Normalize intensity
        
        // Add a point at district center
        filteredPoints.push([
          district.center[0], 
          district.center[1], 
          intensity > 1 ? 1 : intensity
        ]);
      });
    }
    
    setHeatmapPoints(filteredPoints);
  }, [filters, data, districtData]);

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
        center={[22.2587, 71.1924]} // Gujarat center coordinates
        zoom={7} 
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