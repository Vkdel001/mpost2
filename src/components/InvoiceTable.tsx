import React, { useState } from 'react';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { InvoiceData } from '../types/invoice';

interface InvoiceTableProps {
  data: InvoiceData[];
  onDataChange: (data: InvoiceData[]) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ data, onDataChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<InvoiceData | null>(null);

  const startEdit = (item: InvoiceData) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = () => {
    if (editData) {
      const updatedData = data.map(item =>
        item.id === editData.id ? editData : item
      );
      onDataChange(updatedData);
      setEditingId(null);
      setEditData(null);
    }
  };

  const deleteItem = (id: string) => {
    const updatedData = data.filter(item => item.id !== id);
    onDataChange(updatedData);
  };

  const updateEditData = (field: keyof InvoiceData, value: string | number) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MUR'
    }).format(amount);
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No invoice data to display. Upload and process an invoice to see results here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Extracted Invoice Data</h3>
        <p className="text-sm text-gray-600 mt-1">
          Review and edit the extracted information before exporting
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">InvoiceNo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ministry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.id ? (
                    <input
                      type="date"
                      value={editData?.date || ''}
                      onChange={(e) => updateEditData('date', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    item.date
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editData?.invoiceNumber || ''}
                      onChange={(e) => updateEditData('invoiceNumber', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    item.invoiceNumber
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editData?.supplierName || ''}
                      onChange={(e) => updateEditData('supplierName', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    item.supplierName
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  {editingId === item.id ? (
                    <textarea
                      value={editData?.description || ''}
                      onChange={(e) => updateEditData('description', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <div className="truncate" title={item.description}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editData?.quantity || 0}
                      onChange={(e) => updateEditData('quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editData?.amount || 0}
                      onChange={(e) => updateEditData('amount', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    formatCurrency(item.amount)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editData?.vat || 0}
                      onChange={(e) => updateEditData('vat', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    formatCurrency(item.vat)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editData?.total || 0}
                      onChange={(e) => updateEditData('total', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    formatCurrency(item.total)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingId === item.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={saveEdit}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit row"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {/* Grand Total Row */}
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={7} className="px-6 py-4 text-right text-sm text-gray-700">
                Grand Total
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {formatCurrency(grandTotal)}
              </td>
              <td className="px-6 py-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
