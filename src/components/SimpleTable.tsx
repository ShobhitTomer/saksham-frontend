import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import data from "../data/data.json";
import { CrimeReport } from "@/types/type";


type CrimeReportArray = CrimeReport[];

export default function Component() {
  const typedData: CrimeReportArray = data as CrimeReportArray;
  const itemsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and search data
  const filteredData = useMemo(() => {
    return typedData.filter((item) => {
      const matchesCategory = filterCategory ? item.Category === filterCategory : true;
      const matchesSearch = searchTerm
        ? Object.values(item).some(
            (val) =>
              typeof val === "string" &&
              val.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [typedData, filterCategory, searchTerm]);  

  

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Function to generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on either side of current page
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages !== 1) {
      range.push(totalPages);
    }

    return range;
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = Object.keys(filteredData[0]).join(",");
    const csvData = filteredData.map((row) => Object.values(row).join(",")).join("\n");
    const csvContent = `${headers}\n${csvData}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "crime_report.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Select onValueChange={(value) => setFilterCategory(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              
              <SelectItem value="Vehical">Vehical</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
              
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <Table>
        <TableCaption>Crime Report List</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Sr No</TableHead>
            <TableHead>District/City</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>FIR No</TableHead>
            <TableHead>Case Date</TableHead>
            <TableHead>Village</TableHead>
            <TableHead>Taluka</TableHead>
            <TableHead>Occurrence District</TableHead>
            <TableHead>Occurrence City</TableHead>
            <TableHead>Latitude</TableHead>
            <TableHead>Longitude</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Motive</TableHead>
            <TableHead>Is Detected</TableHead>
            <TableHead>Crime Head</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item: CrimeReport) => (
            <TableRow key={item["Sr no"]}>
              <TableCell>{item["Sr no"]}</TableCell>
              <TableCell>{item["District/City"]}</TableCell>
              <TableCell>{item.loc_name}</TableCell>
              <TableCell>{item.fir_no}</TableCell>
              <TableCell>{new Date(item.case_date).toLocaleDateString()}</TableCell>
              <TableCell>{item.Villlage}</TableCell>
              <TableCell>{item.Taluka}</TableCell>
              <TableCell>{item["Occurence District"]}</TableCell>
              <TableCell>{item["Occurence City"]}</TableCell>
              <TableCell>{item.latitude}</TableCell>
              <TableCell>{item.longitude}</TableCell>
              <TableCell>{`${item.first_name} ${item.middle_name} ${item.last_name}`}</TableCell>
              <TableCell>{item.age}</TableCell>
              <TableCell>{item.Gender}</TableCell>
              <TableCell>{item.motive_of_crime}</TableCell>
              <TableCell>{item["IS_DETECTED (Yes/No)"]}</TableCell>
              <TableCell>{item["Crime Head"]}</TableCell>
              <TableCell>{item.Category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {getPageNumbers().map((pageNumber, index) => (
              <PaginationItem key={index}>
                {pageNumber === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(pageNumber as number)}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
