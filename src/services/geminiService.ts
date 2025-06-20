import { GoogleGenerativeAI } from '@google/generative-ai';
import { InvoiceData } from '../types/invoice';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  initialize(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async processInvoice(file: File): Promise<InvoiceData[]> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please provide your API key.');
    }

    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(file);
      
      const prompt = `
        Analyze this invoice and extract the following information in JSON format:
        
        CRITICAL CURRENCY DETECTION RULES - FOLLOW EXACTLY:
        1. FIRST, carefully scan the entire invoice for ANY currency symbols or indicators
        2. Look for: $, USD, Dollar, Rs, ₹, INR, Rupee, Rupees, €, EUR, Euro, £, GBP, Pound
        3. DEFAULT CURRENCY: If NO currency symbol is found anywhere in the invoice, use Indian Rupees (Rs)
        4. ONLY use $ (USD) if you explicitly see a dollar sign ($) or "USD" or "Dollar" written in the invoice
        5. Use Rs for Indian Rupees if you see: Rs, ₹, INR, "Rupee", "Rupees", or if no currency is visible
        
        CURRENCY FORMATTING RULES:
        - Indian Rupees: "Rs 1000.00" (with Rs prefix and 2 decimals)
        - US Dollars: "$1000.00" (with $ prefix and 2 decimals) - ONLY if $ is visible in invoice
        - Other currencies: Use appropriate symbol with 2 decimals
        
        Extract these fields for each line item:
        - date: Invoice date (format: YYYY-MM-DD)
        - supplierName: Name of the supplier/vendor
        - INV No : Invoice Number 
        - description: Description of services/products
        - amount: Base amount (without VAT/tax) - apply currency rules above
        - Qty: Quantity of items/services 
        - vat: VAT/tax amount - same currency as amount
        - total: Total amount including VAT/tax - same currency as amount
        
        IMPORTANT: 
        - If multiple line items exist, return an array
        - If single item, still return as array with one object
        - Use the SAME currency for amount, vat, and total fields
        - Quantity will be listed in the format 3x45  means quantity is 3 or or 4x135 means quantity is 4
        - When in doubt about currency, DEFAULT to Indian Rupees (Rs)
        
        Return ONLY valid JSON without markdown formatting or additional text.
        
        Example for invoice WITHOUT visible currency (default to Rs):
        [
          {
            "date": "2024-01-15",
            "invoiceNumber" : "536733",
            "supplierName": "ABC Services",
            "description": "Consulting services",
            "amount": "Rs 5000.00",
            "quantity": 1,
            "vat": "Rs 900.00",
            "total": "Rs 5900.00"
          }
        ]
        
        Example ONLY when $ symbol is clearly visible in invoice:
        [
          {
            "date": "2024-01-15",
            "invoiceNumber" : "236323",
            "supplierName": "XYZ Corp",
            "description": "Software license",
            "amount": "$1000.00",
            "quantity": 1,
            "vat": "$200.00",
            "total": "$1200.00"
          }
        ]
      `;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Clean up the response to extract JSON
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON in the response
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/) || jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsedData = JSON.parse(jsonText);
      
      // Ensure we have an array
      const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      // Add unique IDs and validate data
      return dataArray.map((item, index) => ({
        id: `invoice-${Date.now()}-${index}`,
        date: item.date || new Date().toISOString().split('T')[0],
        invoiceNumber : item.invoiceNumber || 'Not Found',
        supplierName: item.supplierName || 'Unknown Supplier',
        description: item.description || 'No description provided',
        amount: this.parseAmount(item.amount) || 0,
        quantity: parseFloat(item.quantity) || 1,
        vat: this.parseAmount(item.vat) || 0,
        total: this.parseAmount(item.total) || 0
      }));

    } catch (error) {
      console.error('Error processing invoice:', error);
      throw new Error(`Failed to process invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAmount(amount: string | number): number {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      // Remove currency symbols and parse the number
      const cleanAmount = amount.replace(/[Rs$₹€£,\s]/g, '');
      return parseFloat(cleanAmount) || 0;
    }
    return 0;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const geminiService = new GeminiService();