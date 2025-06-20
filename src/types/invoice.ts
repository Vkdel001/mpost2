export interface InvoiceData {
  id: string;
  date: string;
  invoiceNumber : string;
  supplierName: string;
  description: string;
  amount: number;
  quantity: number;
  vat: number;
  total: number;
}

export interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
  progress?: number;
}