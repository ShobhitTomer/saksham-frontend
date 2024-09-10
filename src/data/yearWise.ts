import { CrimeReport } from "@/types/type";
  type YearlyCrimeData = {
    year: number;
    crimes: number;
  };
  
  // Function to convert Excel date to JavaScript Date
  const excelDateToJSDate = (serial: number): Date => {
    const utc_days = Math.floor(serial - 25569);
    const date_info = new Date(utc_days * 86400 * 1000);
    return date_info;
  };
  
  // Function to group crimes by year
  const groupCrimesByYear = (data: CrimeReport[]): YearlyCrimeData[] => {
    const crimesByYear: Record<number, number> = {};
  
    data.forEach((item) => {
      const date = excelDateToJSDate(item.case_date);
      const year = date.getFullYear();
  
      // Initialize the year count if not present
      if (!crimesByYear[year]) {
        crimesByYear[year] = 0;
      }
  
      // Increment the crime count for the year
      crimesByYear[year]++;
    });
  
    // Convert the object into an array
    return Object.entries(crimesByYear).map(([year, count]) => ({
      year: parseInt(year),
      crimes: count
    }));
  };
  

export {groupCrimesByYear};