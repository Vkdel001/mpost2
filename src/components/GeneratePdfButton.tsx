// src/components/GeneratePdfButton.tsx
import React from 'react';
import { Download } from 'lucide-react';
import { InvoiceData } from '../types/invoice';
import { createSummaryPDF, loadPDF, mergePDFs } from '../services/pdfUtils';

interface GeneratePdfButtonProps {
  data: InvoiceData[];
  originalFile: File | null;
  disabled?: boolean;
}

export const GeneratePdfButton: React.FC<GeneratePdfButtonProps> = ({
  data,
  originalFile,
  disabled = false,
}) => {
  const handleGeneratePdf = async () => {
    if (!originalFile || data.length === 0) {
      alert('Please upload a file and process invoice data first.');
      return;
    }

    try {
      const summaryPdfBytes = await createSummaryPDF(data);
      const originalPdfDoc = await loadPDF(originalFile);
      const mergedPdfBytes = await mergePDFs(summaryPdfBytes, originalPdfDoc);
      const supplierName = data[0]?.supplierName || 'Unknown';
    const safeSupplier = supplierName.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');

    const today = new Date();
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1);
    const monthYear = prevMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' }); // e.g. "May 2025"

    const filename = `${safeSupplier}_${monthYear}.pdf`;

    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

      
    } catch (error) {
      console.error('Error generating combined PDF:', error);
      alert('Failed to generate combined PDF. See console for details.');
    }
  };

  return (
    <button
      onClick={handleGeneratePdf}
      disabled={disabled || data.length === 0 || !originalFile}
      className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        disabled || data.length === 0 || !originalFile
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transform hover:-translate-y-0.5'
      }`}
      title={
        !originalFile
          ? 'No original PDF file selected'
          : data.length === 0
          ? 'No data to generate PDF summary'
          : 'Generate PDF Summary + Annex'
      }
    >
      <Download className="h-5 w-5 mr-2" />
      Generate PDF + Annex
    </button>
  );
};
