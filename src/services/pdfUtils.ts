// src/services/pdfUtils.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { InvoiceData } from '../types/invoice';

// Helper to get last day of previous month in DD/MM/YYYY format
function getLastDayPreviousMonth(): string {
  const today = new Date();
  const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstDayCurrentMonth.getTime() - 1);
  return lastDayPrevMonth.toLocaleDateString('en-GB');
}

// Helper to get previous month in "Mon-YY" format
function getLastMonthMonYY(): string {
  const today = new Date();
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return prevMonth.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

export async function createSummaryPDF(invoiceData: InvoiceData[]) {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;  // A4 width approx
  const pageHeight = 842; // A4 height approx
  const margin = 40;
  const normalFontSize = 10;
  const headerFontSize = 18;
  const clientFontSize = normalFontSize + 2; // 12
  const lineHeight = 18;
  let yPosition = pageHeight - margin;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
const darkBlue = rgb(0, 0, 0.5); // define once in your outer scope

function drawCenteredText(text: string, y: number, size: number, font: any, color: any) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const x = (pageWidth - textWidth) / 2;
  page.drawText(text, { x, y, size, font, color });
}
  function drawHeader() {
    yPosition = pageHeight - margin;

    yPosition -= lineHeight;
    
    // Centered dark blue "THE MAURITIUS POST LTD."
  drawCenteredText('THE MAURITIUS POST LTD.', yPosition, headerFontSize, fontBold, darkBlue);
  yPosition -= lineHeight;

  // Centered dark blue tel/fax line
  drawCenteredText('Tel 208-2851/55 Fax 211-2262/210-2581', yPosition, normalFontSize, fontRegular, darkBlue);
  yPosition -= lineHeight;

  // 1 line space after
  yPosition -= lineHeight;



    page.drawText('Credit Sales', {
      x: margin,
      y: yPosition,
      size: 12,
      font: fontBold,
    });
    yPosition -= lineHeight;

    // Add CLIENT line here in BOLD, bigger font and UNDERLINED
    // Use supplierName from first invoice or 'N/A' if none
    const clientName = invoiceData.length > 0 ? invoiceData[0].supplierName : 'N/A';
    const clientText = `CLIENT : ${clientName}`;
    page.drawText(clientText, {
      x: margin,
      y: yPosition,
      size: clientFontSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Draw underline for CLIENT line
    const textWidth = fontBold.widthOfTextAtSize(clientText, clientFontSize);
    page.drawLine({
      start: { x: margin, y: yPosition - 2 },
      end: { x: margin + textWidth, y: yPosition - 2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    yPosition -= lineHeight * 1.2;

    page.drawText(`Invoice Number : MIN_NO`, {
      x: margin,
      y: yPosition,
      size: normalFontSize,
      font: fontRegular,
    });
    page.drawText(`Date : ${getLastDayPreviousMonth()}`, {
      x: pageWidth / 2,
      y: yPosition,
      size: normalFontSize,
      font: fontRegular,
    });
    yPosition -= lineHeight;

    page.drawText(`Postage Due for period : ${getLastMonthMonYY()}`, {
      x: margin,
      y: yPosition,
      size: normalFontSize,
      font: fontRegular,
    });
    yPosition -= lineHeight;

    page.drawText('Business Registration Number : C07027647', {
      x: margin,
      y: yPosition,
      size: normalFontSize,
      font: fontRegular,
    });
    yPosition -= lineHeight * 2; // extra space before table
  }

  function drawTableHeader() {
    const headers = ['Invoice No.', 'Date', 'Description', 'Amount', 'Qty', 'Fees', 'Total'];
    const colX = [margin, 100, 160, 320, 380, 420, 460];
    const headerY = yPosition;

    headers.forEach((text, i) => {
      page.drawText(text, {
        x: colX[i],
        y: headerY,
        size: normalFontSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
    });

    // Underline for header row
    page.drawLine({
      start: { x: margin, y: headerY - 2 },
      end: { x: pageWidth - margin, y: headerY - 2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    yPosition -= lineHeight;
  }

  function drawTableRow(inv: InvoiceData, rowIndex: number) {
    const colX = [margin, 100, 160, 320, 380, 420, 460];
    const rowY = yPosition;

    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: rowY - 3,
        width: pageWidth - 2 * margin,
        height: lineHeight,
        color: rgb(0.95, 0.95, 0.95),
      });
    }

    page.drawText(inv.invoiceNumber || '', { x: colX[0], y: rowY, size: normalFontSize, font: fontRegular });
    page.drawText(inv.date || '', { x: colX[1], y: rowY, size: normalFontSize, font: fontRegular });
    page.drawText(inv.description || '', { x: colX[2], y: rowY, size: normalFontSize, font: fontRegular });
    page.drawText((inv.amount ?? 0).toFixed(2), { x: colX[3], y: rowY, size: normalFontSize, font: fontRegular });
    page.drawText((inv.quantity ?? 0).toString(), { x: colX[4], y: rowY, size: normalFontSize, font: fontRegular });
    page.drawText((inv.vat ?? 0).toFixed(2), { x: colX[5], y: rowY, size: normalFontSize, font: fontRegular });
    page.drawText((inv.total ?? 0).toFixed(2), { x: colX[6], y: rowY, size: normalFontSize, font: fontRegular });

    yPosition -= lineHeight;
  }

  function addNewPage() {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    yPosition = pageHeight - margin;
    drawHeader();
    drawTableHeader();
  }

  function checkSpaceAndAddPage(requiredSpace: number) {
    if (yPosition < margin + requiredSpace) {
      addNewPage();
    }
  }

  // Draw header and table header
  drawHeader();
  drawTableHeader();

  // Draw table rows
  for (let i = 0; i < invoiceData.length; i++) {
    checkSpaceAndAddPage(lineHeight);
    drawTableRow(invoiceData[i], i);
  }

  // After table ends, add 2 lines space
  yPosition -= lineHeight * 2;

  // Footer text lines
  const footerLines = [
    'FOR FURTHER DETAILS, CONTACT MS TRISHALA ON 208 2851, EXT 109',
    '',
    'NOTE',
    'a) Payment should be effected within one week from date of receipt of this Invoice.',
    "b) Cheque to be drawn in favour of 'THE MAURITIUS POST LTD' and addressed to:",
    '   Finance Department, The Mauritius Post Ltd, 1, Sir William Newton, Port Louis 11328, together with a copy',
    '   of this invoice.',
    'c) However, if amount is settled through bank transfer as per details below:',
    '',
    'Bank Name         : MauBank Ltd',
    'Bank Address      : 25, Bank Street, Ebene 72201',
    'Bank a/c no       : 011000593450MUR',
    'IBAN No           : MU34MPCB1215011000593450000MUR',
    '',
    'kindly submit detail of payment on the following email addresses:',
    '   dmooteea@mauritiuspost.mu',
    '   finance@mauritiuspost.mu',
    '   rauckloo@mauritiuspost.mu',
    '',
    'Signature. ................................',
    '',
    'Head of Finance'
  ];

  // Draw footer lines with page-break handling
  for (const line of footerLines) {
    checkSpaceAndAddPage(lineHeight);
    page.drawText(line, { x: margin, y: yPosition, size: normalFontSize, font: fontRegular });
    yPosition -= lineHeight;
  }

  return await pdfDoc.save();
}

export async function loadPDF(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return await PDFDocument.load(arrayBuffer);
}

export async function mergePDFs(summaryBytes: Uint8Array, originalPdf: PDFDocument) {
  const mergedPdf = await PDFDocument.create();

  const summaryPdf = await PDFDocument.load(summaryBytes);
  const summaryPages = await mergedPdf.copyPages(summaryPdf, summaryPdf.getPageIndices());
  summaryPages.forEach(page => mergedPdf.addPage(page));

  const originalPages = await mergedPdf.copyPages(originalPdf, originalPdf.getPageIndices());
  originalPages.forEach(page => mergedPdf.addPage(page));

  return await mergedPdf.save();
}
