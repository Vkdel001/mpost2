import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { InvoiceData } from '../types/invoice';

interface ExportButtonProps {
  data: InvoiceData[];
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, disabled = false }) => {
  const exportToExcel = () => {
    if (data.length === 0) return;

    // Prepare data for Excel export
    const excelData = data.map(item => ({
      'Invoice Date': item.date,
      'Supplier Name': item.supplierName,
      'Description': item.description,
      'Quantity': item.quantity,
      'Amount': item.amount,
      'VAT': item.vat,
      'Total': item.total
    }));

    //Calculate grand total
    const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

   

// Grand total row
excelData.push({
  'Invoice Date': '',
  'Supplier Name': '',
  'Description': 'GRAND TOTAL',
  'Quantity': 0,
  'Amount': 0,
  'VAT': 0,
  'Total': grandTotal
});

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Invoice Date
      { wch: 20 }, // Supplier Name
      { wch: 40 }, // Description
      { wch: 10 }, // Quantity
      { wch: 12 }, // Amount
      { wch: 12 }, // VAT
      { wch: 12 }  // Total
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice Data');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `invoice-data-${currentDate}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={disabled || data.length === 0}
      className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        disabled || data.length === 0
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-0.5'
      }`}
      title={data.length === 0 ? 'No data to export' : 'Export to Excel'}
    >
      <FileSpreadsheet className="h-5 w-5 mr-2" />
      Export to Excel
      <Download className="h-4 w-4 ml-2" />
    </button>
  );
};