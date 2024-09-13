import { useState } from "react";
import { MapContainer, TileLayer , Marker} from "react-leaflet";
import detail from "./detail";
import "leaflet/dist/leaflet.css"
import {Icon} from "leaflet"

// Define the types for center coordinates
type LatLng = {
  lat: number;
  lng: number;
};

const HeatGraph = () => {
  // const markers=[
  //   {
  //     geocode:[],
  //     popUp:"Theft 1"
  //   }
  // ]
  // Default map center coordinates with proper typing
  //const [center] = useState<LatLng>({ lat: 21.19198, lng: 72.77905 });
  const zoom_level = 9;
  // const customIcon = new Icon<{}>

  return (
    <div className="w-full h-[500px]"> {/* Full width and a height of 500px */}
      <MapContainer
        center={[ 21.19198, 72.77905]}
        zoom={zoom_level}
      >
        <TileLayer
          url={detail.maptiler.url}
          attribution={detail.maptiler.attribution}
        />
        {/* {
          markers.map(marker=>(
            <Marker position={marker.geocode}>

            </Marker>
          ))
        } */}
      </MapContainer>
    </div>
  );
};

export default HeatGraph;
