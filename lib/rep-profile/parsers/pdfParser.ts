// PDF Parser implementation using pdf.js
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
// In Next.js client-side, we need to point to the worker file.
// Usually we copy it to public or use a CDN.
// For now, I'll use the CDN approach as in the original code, but I need to make sure global worker options are set correctly.
// Also, pdfjs-dist import might be different in TS.

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export class PDFParser {
  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error: any) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }
}

