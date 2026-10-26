/**
 * File Upload Service
 * Provides file validation and utility functions for file uploads
 */

// S3 Bucket configuration (matching S3_BUCKETS from s3.service.ts)
export const BUCKETS = {
  UPLOADS: 'uploads',
  GOVERNMENT_REPORTS: 'government-reports',
  DAILY_STOCK_PHOTOS: 'daily-stock-photos',
  PROFILE_IMAGES: 'profile-images',
  PROCESSED_FILES: 'processed-files'
} as const;

export type BucketKey = keyof typeof BUCKETS;

/**
 * Allowed file types per category
 */
export const ALLOWED_FILE_TYPES = {
  GOVERNMENT_REPORTS: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv'
  ],
  DAILY_STOCK_PHOTOS: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ],
  PROFILE_IMAGES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ],
  IMAGES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ],
  UPLOADS: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
} as const;

/**
 * Maximum file sizes per category (in bytes)
 */
export const MAX_FILE_SIZES = {
  GOVERNMENT_REPORTS: 50 * 1024 * 1024, // 50MB
  DAILY_STOCK_PHOTOS: 10 * 1024 * 1024, // 10MB
  PROFILE_IMAGES: 5 * 1024 * 1024, // 5MB
  UPLOADS: 50 * 1024 * 1024, // 50MB
  PROCESSED_FILES: 100 * 1024 * 1024 // 100MB
} as const;

/**
 * Validate file type against allowed types
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if file type is valid
 */
export function validateFileType(file: File, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size against maximum
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes
 * @returns True if file size is valid
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Get file extension from filename
 * @param filename - Name of the file
 * @returns File extension (e.g., 'pdf', 'jpg')
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Generate safe filename
 * @param originalFilename - Original filename
 * @param prefix - Optional prefix to add
 * @returns Safe filename with timestamp
 */
export function generateSafeFilename(originalFilename: string, prefix?: string): string {
  const timestamp = Date.now();
  const extension = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;

  // Remove special characters and spaces
  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50); // Limit length

  const prefixPart = prefix ? `${prefix}_` : '';
  return `${prefixPart}${safeName}_${timestamp}.${extension}`;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., '1.5 MB')
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * FileUploadService class for static access
 */
export class FileUploadService {
  static BUCKETS = BUCKETS;
  static ALLOWED_FILE_TYPES = ALLOWED_FILE_TYPES;
  static MAX_FILE_SIZES = MAX_FILE_SIZES;

  static validateFileType = validateFileType;
  static validateFileSize = validateFileSize;
  static getFileExtension = getFileExtension;
  static generateSafeFilename = generateSafeFilename;
  static formatFileSize = formatFileSize;
}

