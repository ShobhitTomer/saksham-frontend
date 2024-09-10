import { CrimeReport } from "@/types/type";

interface CrimeData {
    case_date: number; // Excel serial date
  }
  
  interface ChartData {
    month: string;
    crimes: number;
  }
  
  const monthCrime = (data: CrimeReport[]): ChartData[] => {
  
    // Function to convert Excel date to JavaScript Date
    const excelDateToJSDate = (serial: number): Date => {
      const utc_days = Math.floor(serial - 25569);
      const date_info = new Date(utc_days * 86400 * 1000);
      return date_info;
    };
  
    // Initialize an empty object to store crime counts per month
    const crimesByMonth: Record<string, number> = {};
  
    // Iterate over the data
    data.forEach((item: CrimeData) => {
      const date = excelDateToJSDate(item.case_date);
      const month = date.toLocaleString("default", { month: "long" });
  
      if (!crimesByMonth[month]) {
        crimesByMonth[month] = 0;
      }
  
      crimesByMonth[month]++;
    });
  
    const chartData: ChartData[] = Object.entries(crimesByMonth).map(
      ([month, count]) => {
        return {
          month,
          crimes: count
        };
      }
    );
  
    return chartData;
  };
  
  export { monthCrime };
  