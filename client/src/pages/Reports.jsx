import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  VStack,
} from "@chakra-ui/react";
import { Play, Download } from "react-feather";
import { getInventoryReport } from "../services/api";

const Reports = () => {
  const [params, setParams] = useState({
    reportType: "stock-levels",
    category: "all",
    dateFrom: "",
    dateTo: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setReportData(null);
    try {
      const { data } = await getInventoryReport(params);
      setReportData(data);
    } catch (error) {
      toast({
        title: "Error generating report",
        description: error.response?.data?.message || "Could not fetch report data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // A placeholder for CSV export functionality
  const handleExportCsv = () => {
    if (!reportData || reportData.items.length === 0) {
      toast({ title: "No data to export", status: "warning", duration: 3000 });
      return;
    }
    // Basic CSV conversion
    const headers = Object.keys(reportData.items[0]).join(",");
    const rows = reportData.items.map(row => Object.values(row).join(",")).join("\\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportData.title.replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Box>
      <header>
        <Heading size="lg">Reports</Heading>
        <Text mt={1} color="gray.400">
          Generate and export custom inventory reports.
        </Text>
      </header>

      <Box
        as="form"
        onSubmit={handleGenerateReport}
        bg="var(--card-bg)"
        p={6}
        borderRadius="lg"
        mt={6}
        borderWidth="1px"
        borderColor="var(--border-color)"
      >
        <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4}>
          <FormControl>
            <FormLabel>Report Type</FormLabel>
            <Select name="reportType" value={params.reportType} onChange={handleInputChange}>
              <option value="stock-levels">Current Stock Levels</option>
              <option value="low-stock">Low Stock Alerts</option>
              <option value="inventory-value">Inventory Value</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Date From</FormLabel>
            <Input type="date" name="dateFrom" value={params.dateFrom} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Date To</FormLabel>
            <Input type="date" name="dateTo" value={params.dateTo} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Category</FormLabel>
            <Select name="category" value={params.category} onChange={handleInputChange}>
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Groceries">Groceries</option>
              <option value="Apparel">Apparel</option>
              <option value="Books">Books</option>
              <option value="Home Goods">Home Goods</option>
            </Select>
          </FormControl>
          <Button type="submit" colorScheme="pink" alignSelf="end" isLoading={isLoading} leftIcon={<Play size={18} />}>
            Generate
          </Button>
        </SimpleGrid>
      </Box>

      {isLoading && (
        <Center p={10}>
          <Spinner size="xl" />
        </Center>
      )}

      {reportData && (
        <Box mt={8}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">{reportData.title}</Heading>
            <Button onClick={handleExportCsv} leftIcon={<Download size={18} />} variant="outline">
              Export CSV
            </Button>
          </Flex>
          <Box bg="var(--card-bg)" borderRadius="lg" borderWidth="1px" borderColor="var(--border-color)">
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    {reportData.headers.map((header) => (
                      <Th key={header}>{header}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {reportData.items.map((item, index) => (
                    <Tr key={index}>
                      {Object.values(item).map((value, i) => (
                        <Td key={i}>{typeof value === 'number' && reportData.headers[i].toLowerCase().includes('value') ? `$${value.toFixed(2)}` : value}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
             {reportData.summary && (
              <Box p={4} textAlign="right" fontWeight="bold" borderTopWidth="1px" borderColor="var(--border-color)">
                {reportData.summary.label}: ${reportData.summary.value.toFixed(2)}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
