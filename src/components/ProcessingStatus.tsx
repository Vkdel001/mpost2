import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ProcessingStatus as ProcessingStatusType } from '../types/invoice';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status }) => {
  if (status.status === 'idle') return null;

  const getStatusIcon = () => {
    switch (status.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium">
            {status.status === 'uploading' && 'Uploading invoice...'}
            {status.status === 'processing' && 'Processing with AI...'}
            {status.status === 'completed' && 'Processing completed!'}
            {status.status === 'error' && 'Processing failed'}
          </p>
          {status.message && (
            <p className="text-sm opacity-80 mt-1">{status.message}</p>
          )}
        </div>
        {status.progress !== undefined && (
          <div className="w-32">
            <div className="bg-white bg-opacity-50 rounded-full h-2">
              <div
                className="bg-current h-2 rounded-full transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              />
            </div>
            <p className="text-xs mt-1">{status.progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};