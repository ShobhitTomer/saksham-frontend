import * as XLSX from 'xlsx';
import * as fs from 'fs'; 

type ExcelRow = {
  [key: string]: string | number;
};

// Function to read Excel file and convert to JSON
export const excelToJson = (filePath: string): ExcelRow[] | null => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];

    // Get the worksheet data
    const worksheet = workbook.Sheets[sheetName];

    // Convert the worksheet to JSON
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    return jsonData;
  } catch (error) {
    console.error('Error processing the Excel file:', error);
    return null;
  }
};

