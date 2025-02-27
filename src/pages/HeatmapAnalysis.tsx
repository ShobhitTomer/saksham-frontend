import { useState, useEffect } from "react";
import HeatmapWithFilters from "@/components/graph/Heatmap";

function HeatmapAnalysis() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay to show the message
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Adjust the delay as needed

    return () => clearTimeout(timer); // Cleanup timer when the component unmounts
  }, []);

  return (
    <div className="container mx-auto px-4">

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-[500px] gap-4">
          <p className="text-xl font-semibold">Please wait while the data is being fetched...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <HeatmapWithFilters />
      )}
    </div>
  );
}

export default HeatmapAnalysis;
