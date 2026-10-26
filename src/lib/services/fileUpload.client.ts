import { FileUploadService } from './fileUpload.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

/**
 * Client-side service for File Upload API
 * All methods make fetch calls to Next.js API routes
 */
export class FileUploadClientService {
  /**
   * Upload a government report file
   */
  static async uploadGovernmentReport(
    file: File,
    uploadedBy: string
  ): Promise<{ uploadSession: any; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);
    formData.append('uploadType', 'government_report');

    const response = await fetch(`${API_BASE_URL}/api/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload government report: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload government report');
    }

    return result.data;
  }

  /**
   * Upload a daily stock photo
   */
  static async uploadDailyStockPhoto(
    file: File,
    stockId: string,
    shopId: string
  ): Promise<{ path: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('stockId', stockId);
    formData.append('shopId', shopId);
    formData.append('uploadType', 'daily_stock_photo');

    const response = await fetch(`${API_BASE_URL}/api/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload daily stock photo: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload daily stock photo');
    }

    return result.data;
  }

  /**
   * Upload a profile image
   */
  static async uploadProfileImage(
    file: File,
    userId: string
  ): Promise<{ path: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('uploadType', 'profile_image');

    const response = await fetch(`${API_BASE_URL}/api/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload profile image: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload profile image');
    }

    return result.data;
  }

  /**
   * Upload a generic file
   */
  static async uploadFile(
    file: File,
    bucket: keyof typeof FileUploadService.BUCKETS,
    path: string,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ): Promise<{ path: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);
    formData.append('uploadType', 'generic');

    if (options?.cacheControl) {
      formData.append('cacheControl', options.cacheControl);
    }
    if (options?.contentType) {
      formData.append('contentType', options.contentType);
    }
    if (options?.upsert !== undefined) {
      formData.append('upsert', options.upsert.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload file');
    }

    return result.data;
  }

  /**
   * Get signed URL for private file access
   */
  static async getSignedUrl(
    bucket: keyof typeof FileUploadService.BUCKETS,
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/upload/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucket, path, expiresIn }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get signed URL');
    }

    return result.data.url;
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(
    bucket: keyof typeof FileUploadService.BUCKETS,
    path: string
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/upload/delete?bucket=${bucket}&path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete file');
    }
  }

  /**
   * List files in a directory
   */
  static async listFiles(
    bucket: keyof typeof FileUploadService.BUCKETS,
    directory: string = '',
    limit: number = 100
  ): Promise<Array<{
    name: string;
    size: number;
    last_modified: string;
    metadata: any;
  }>> {
    const response = await fetch(
      `${API_BASE_URL}/api/upload/history?bucket=${bucket}&directory=${encodeURIComponent(directory)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to list files');
    }

    return result.data;
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(
    bucket: keyof typeof FileUploadService.BUCKETS,
    path: string
  ): Promise<{
    size: number;
    last_modified: string;
    metadata: any;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/upload/metadata?bucket=${bucket}&path=${encodeURIComponent(path)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get file metadata: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get file metadata');
    }

    return result.data;
  }

  /**
   * Get upload session details
   */
  static async getUploadSession(sessionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/upload/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch upload session: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch upload session');
    }

    return result.data;
  }

  /**
   * Update upload session status
   */
  static async updateUploadSessionStatus(
    sessionId: string,
    status: 'uploaded' | 'processing' | 'completed' | 'failed',
    progress?: {
      total_records?: number;
      processed_records?: number;
      successful_records?: number;
      failed_records?: number;
      error_summary?: any;
    }
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/upload/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, progress }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update upload session: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update upload session');
    }
  }

  // Re-export validation methods for convenience
  static validateFileType = FileUploadService.validateFileType;
  static validateFileSize = FileUploadService.validateFileSize;
  static ALLOWED_FILE_TYPES = FileUploadService.ALLOWED_FILE_TYPES;
  static MAX_FILE_SIZES = FileUploadService.MAX_FILE_SIZES;
}
