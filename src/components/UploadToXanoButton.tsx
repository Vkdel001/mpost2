// src/components/UploadToXanoButton.tsx
import React from 'react';
import { Upload } from 'lucide-react';
import { InvoiceData } from '../types/invoice';

interface UploadToXanoButtonProps {
  data: InvoiceData[];
  disabled?: boolean;
  onUpload: () => Promise<void>;
}

export const UploadToXanoButton: React.FC<UploadToXanoButtonProps> = ({ data, disabled = false, onUpload }) => {
  const isDisabled = disabled || data.length === 0;

  return (
    <button
      onClick={onUpload}
      disabled={isDisabled}
      className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isDisabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5'
      }`}
      title={data.length === 0 ? 'No data to upload' : 'Upload to Xano'}
    >
      <Upload className="h-5 w-5 mr-2" />
      Upload to Xano
    </button>
  );
};
