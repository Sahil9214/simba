/**
 * OCR Service Types
 * Defines the data structures for OCR processing
 */

/**
 * Bounding box coordinates
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extracted word from OCR
 */
export interface ExtractedWord {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

/**
 * Extracted line from OCR
 */
export interface ExtractedLine {
  text: string;
  confidence: number;
  words: ExtractedWord[];
  boundingBox: BoundingBox;
}

/**
 * Table data extracted from OCR
 */
export interface TableData {
  headers: string[];
  rows: string[][];
  confidence: number;
  boundingBox?: BoundingBox;
}

/**
 * OCR processing options
 */
export interface OCROptions {
  language?: string | string[];
  detectOrientation?: boolean;
  detectTables?: boolean;
  detectHandwriting?: boolean;
  confidenceThreshold?: number;
  preprocessImage?: boolean;
  outputFormat?: 'text' | 'json' | 'structured';
}

/**
 * OCR processing result
 */
export interface OCRResult {
  id: string;
  text: string;
  confidence: number;
  language: string;
  lines: ExtractedLine[];
  words: ExtractedWord[];
  tables?: TableData[];
  metadata: {
    width: number;
    height: number;
    processingTime: number;
    orientation?: number;
    pageCount?: number;
  };
  createdAt: string;
}

/**
 * OCR processing session
 */
export interface OCRProcessingSession {
  id: string;
  fileUrl: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: OCRResult;
  error?: string;
  options: OCROptions;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * OCR batch processing request
 */
export interface OCRBatchRequest {
  files: File[];
  options: OCROptions;
  callback?: (sessionId: string, result: OCRResult) => void;
}

/**
 * OCR statistics
 */
export interface OCRStatistics {
  totalProcessed: number;
  successRate: number;
  averageConfidence: number;
  averageProcessingTime: number;
  byLanguage: Record<string, number>;
  errorRate: number;
}
















