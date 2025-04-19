import { PDFDocument } from 'pdf-lib';

export class PDFHandler {
  static async extractText(pdfFile: File): Promise<string> {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // Since pdf-lib doesn't provide direct text extraction
      // We'll return page data that can be processed later
      const textContent = pages.map(page => {
        const { width, height } = page.getSize();
        return `Page (${width}x${height})\n`;
      }).join('\n');
      
      // Note: For actual text extraction, you might want to use pdf.js instead:
      // npm install pdfjs-dist
      
      return textContent;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }

  static async validatePDF(file: File): Promise<boolean> {
    if (!file.type.includes('pdf')) {
      throw new Error('File must be a PDF');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('PDF file size must be less than 5MB');
    }
    
    return true;
  }
}