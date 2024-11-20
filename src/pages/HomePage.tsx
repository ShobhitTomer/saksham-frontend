import BarChartComponent from "@/components/graph/BarChartComponent";
import HeatmapComponent from "@/components/graph/HeatMapLeaflet";
import LineChartComponent from "@/components/graph/LineChartComponent";
import PieChartComponent from "@/components/graph/PieChartComponent";

const HomePage = () => {
  return (
    <>
    <div className="container mx-auto px-4 h-screen w-full">
      <h1 className="text-4xl font-bold text-center mb-8">Saksham</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full ">
        <div className="col-span-1 md:col-span-1 w-full ">
          <BarChartComponent />
        </div>
        <div className="col-span-1 md:col-span-1 w-full">
          <LineChartComponent />
        </div>

        <div className="col-span-1 md:col-span-1 w-full ">
          <PieChartComponent />
        </div>
        <div className="col-span-1 md:col-span-1 w-full ">
          <HeatmapComponent />
        </div>
      </div>
    </div>
    </>
  );
};

export default HomePage;
