import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Brain, Download, Sparkles, LogOut, User } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { ProcessingStatus } from './components/ProcessingStatus';
import { InvoiceTable } from './components/InvoiceTable';
import { ExportButton } from './components/ExportButton';
import { UploadToXanoButton } from './components/UploadToXanoButton';
import { ApiKeyInput } from './components/ApiKeyInput';
import { AuthWrapper } from './components/AuthWrapper';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import { GeneratePdfButton } from './components/GeneratePdfButton';
import { InvoiceData, ProcessingStatus as ProcessingStatusType } from './types/invoice';

interface AppProps {
  onLogout?: () => void;
}

function AppContent({ onLogout }: AppProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType>({
    status: 'idle'
  });
  const [invoiceData, setInvoiceData] = useState<InvoiceData[]>([]);

  const currentUser = authService.getCurrentUser();

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    try {
      geminiService.initialize(key);
      setApiKeyValid(true);
      localStorage.setItem('gemini-api-key', key);
    } catch (error) {
      setApiKeyValid(false);
      console.error('Failed to initialize Gemini API:', error);
    }
  };

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      handleApiKeySet(savedApiKey);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setInvoiceData([]);
  };

  const sendToXano = async (invoice: InvoiceData) => {
    try {
      const response = await axios.post(
        'https://x8ki-letl-twmt.n7.xano.io/api:-qPAhAnS/invoices',
        {
          invoice_number: invoice.id || '',
          date: invoice.date || '',
          vendor: invoice.supplierName || '',
          total_amount: invoice.total || 0
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Invoice sent to Xano:', response.data);
    } catch (err) {
      console.error('❌ Failed to send invoice to Xano:', err);
      throw err;
    }
  };

  const processInvoice = async () => {
    if (!selectedFile || !apiKey) return;

    setProcessingStatus({ status: 'processing', message: 'Analyzing invoice with AI...' });

    try {
      const extractedData = await geminiService.processInvoice(selectedFile);
      setInvoiceData(extractedData);

      setProcessingStatus({
        status: 'completed',
        message: `Successfully extracted ${extractedData.length} invoice(s). You can now export or upload to Xano.`
      });
    } catch (error) {
      console.error('Error processing invoice:', error);
      setProcessingStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to process invoice'
      });
    }
  };

  const handleUploadToXano = async () => {
    if (invoiceData.length === 0) {
      alert('No invoice data to upload.');
      return;
    }

    setProcessingStatus({
      status: 'processing',
      message: 'Uploading invoice(s) to Xano...'
    });

    try {
      for (const invoice of invoiceData) {
        await sendToXano(invoice);
      }

      setProcessingStatus({
        status: 'completed',
        message: `Uploaded ${invoiceData.length} invoice(s) to Xano successfully ✅`
      });
    } catch (err) {
      console.error('❌ Error uploading to Xano:', err);
      setProcessingStatus({
        status: 'error',
        message: 'Failed to upload invoices to Xano'
      });
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  if (!apiKeyValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">{currentUser?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Invoice Processor
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Extract structured data from invoices using advanced AI technology
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ApiKeyInput onApiKeySet={handleApiKeySet} isValid={apiKeyValid} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">{currentUser?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Invoice Processor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Extract structured data from invoices using AI and export to Excel
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Upload the Invoice</h2>
            </div>

            <FileUploader
              onFileSelect={handleFileSelect}
              processing={processingStatus.status === 'processing'}
            />

            {selectedFile && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={processInvoice}
                  disabled={processingStatus.status === 'processing'}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Process Invoice with AI
                  <Brain className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}
          </div>

          {processingStatus.status !== 'idle' && (
            <ProcessingStatus status={processingStatus} />
          )}

          {invoiceData.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-emerald-600 font-semibold">2</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Review & Export Data</h2>
                </div>

                <div className="flex items-center space-x-4">
                  <ExportButton
                    data={invoiceData}
                    disabled={processingStatus.status === 'processing'}
                  />
                  <UploadToXanoButton
                    data={invoiceData}
                    disabled={processingStatus.status === 'processing'}
                    onUpload={handleUploadToXano}
                  />
                  <GeneratePdfButton
                    data={invoiceData}
                    originalFile={selectedFile}
                    disabled={processingStatus.status === 'processing'}
                    />
                </div>
              </div>

              <InvoiceTable data={invoiceData} onDataChange={setInvoiceData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthWrapper>
      <AppContent />
    </AuthWrapper>
  );
}

export default App;
