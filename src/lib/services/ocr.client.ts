/**
 * Client-safe OCR Service
 * Uses API routes instead of direct database access
 */

export type {
  OCROptions,
  OCRResult,
  OCRProcessingSession,
  BoundingBox,
  ExtractedWord,
  ExtractedLine,
  TableData
} from './ocr.service';

export class OCRClientService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

  /**
   * Process image/document with OCR via API route
   * @param file - File to process
   * @param options - OCR processing options
   * @returns OCR result
   */
  static async processImage(file: File, options?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options || {}));

    const response = await fetch(`${this.API_BASE_URL}/api/ai/ocr/process`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'OCR processing failed');
    }

    return response.json();
  }

  /**
   * Get OCR result by ID via API route
   * @param id - OCR result ID
   * @returns OCR result or null
   */
  static async getOCRResult(id: string): Promise<any> {
    const response = await fetch(`${this.API_BASE_URL}/api/ai/ocr/result/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get OCR result');
    }

    return response.json();
  }

  /**
   * Get OCR processing session via API route
   * @param sessionId - Processing session ID
   * @returns Processing session or null
   */
  static async getProcessingSession(sessionId: string): Promise<any> {
    const response = await fetch(`${this.API_BASE_URL}/api/ai/ocr/session/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get OCR session');
    }

    return response.json();
  }

  /**
   * Update OCR processing session via API route
   * @param sessionId - Processing session ID
   * @param updates - Updates to apply
   */
  static async updateProcessingSession(sessionId: string, updates: any): Promise<void> {
    const response = await fetch(`${this.API_BASE_URL}/api/ai/ocr/session/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update OCR session');
    }
  }
}
