// Import the entire library object
const XLSX = require("xlsx");

/**
 * Converts an Excel serial date number to a JavaScript Date object.
 * @param {number} excelSerialDate - The Excel serial date number.
 * @returns {Date | null} - The corresponding JavaScript Date object, or null if invalid.
 */
function convertExcelDate(excelSerialDate) {
  if (
    typeof excelSerialDate !== "number" ||
    isNaN(excelSerialDate) ||
    excelSerialDate <= 0
  ) {
    return null; // Handle invalid input
  }
  try {
    // Check if the required properties exist directly on XLSX.SSF
    if (
      !XLSX ||
      !XLSX.SSF || // Check for SSF directly on XLSX
      typeof XLSX.SSF.parse_date_code !== "function" // Check for the function on XLSX.SSF
    ) {
      console.error(
        "XLSX library structure error: XLSX.SSF or XLSX.SSF.parse_date_code not found."
      );
      return null;
    }
    // Access SSF directly on the main XLSX object
    const dateInfo = XLSX.SSF.parse_date_code(excelSerialDate);
    if (!dateInfo) return null;
    // Construct Date object (months are 0-indexed)
    return new Date(
      dateInfo.y,
      dateInfo.m - 1,
      dateInfo.d,
      dateInfo.H,
      dateInfo.M,
      dateInfo.S
    );
  } catch (e) {
    console.error("Error converting Excel date:", excelSerialDate, e);
    return null;
  }
}

/**
 * Formats a Date object into YYYY-MM-DD string.
 * @param {Date | null} date - The Date object.
 * @returns {string} - Formatted date string or 'N/A'.
 */
function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return "N/A";
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = { convertExcelDate, formatDate };
