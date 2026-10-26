/**
 * S3 Storage Service
 * Replaces Supabase Storage with AWS S3 integration
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  uploadsBucket: string;
  ocrBucket: string;
}

interface UploadOptions {
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

class S3StorageService {
  private client: S3Client;
  private config: S3Config;

  constructor() {
    this.config = {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      uploadsBucket: process.env.S3_UPLOADS_BUCKET!,
      ocrBucket: process.env.S3_OCR_BUCKET!,
    };

    this.client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  /**
   * Upload file to S3 (replaces Supabase storage.upload)
   */
  async uploadFile(
    path: string, 
    file: File | Buffer, 
    options: UploadOptions = {}
  ): Promise<{ data: { path: string; url: string } | null; error: Error | null }> {
    try {
      const bucket = options.bucket || this.config.uploadsBucket;
      
      let body: Buffer;
      let contentType: string;

      if (file instanceof File) {
        body = Buffer.from(await file.arrayBuffer());
        contentType = options.contentType || file.type;
      } else {
        body = file;
        contentType = options.contentType || 'application/octet-stream';
      }

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: body,
        ContentType: contentType,
        Metadata: options.metadata,
      });

      await this.client.send(command);
      
      const url = `https://${bucket}.s3.${this.config.region}.amazonaws.com/${path}`;

      return {
        data: { path, url },
        error: null,
      };

    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Get signed URL for secure file access (replaces Supabase getSignedUrl)
   */
  async getSignedUrl(
    path: string, 
    expiresIn: number = 3600,
    bucket?: string
  ): Promise<{ data: { signedUrl: string } | null; error: Error | null }> {
    try {
      const bucketName = bucket || this.config.uploadsBucket;
      
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: path,
      });

      const signedUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      return {
        data: { signedUrl },
        error: null,
      };

    } catch (error) {
      console.error('S3 signed URL error:', error);
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Delete file from S3 (replaces Supabase storage.remove)
   */
  async deleteFile(
    path: string,
    bucket?: string
  ): Promise<{ data: null; error: Error | null }> {
    try {
      const bucketName = bucket || this.config.uploadsBucket;

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: path,
      });

      await this.client.send(command);

      return {
        data: null,
        error: null,
      };

    } catch (error) {
      console.error('S3 delete error:', error);
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Upload to OCR bucket with specific naming convention
   */
  async uploadForOCR(
    sessionId: string,
    fileName: string,
    file: File | Buffer
  ): Promise<{ data: { path: string; url: string } | null; error: Error | null }> {
    const path = `session_${sessionId}/${fileName}`;
    
    return this.uploadFile(path, file, {
      bucket: this.config.ocrBucket,
      metadata: {
        'session-id': sessionId,
        'original-filename': fileName,
        'uploaded-at': new Date().toISOString(),
      },
    });
  }

  /**
   * Upload user avatar (replaces Supabase avatar uploads)
   */
  async uploadAvatar(
    userId: string,
    file: File
  ): Promise<{ data: { path: string; url: string } | null; error: Error | null }> {
    const fileExt = file.name.split('.').pop();
    const path = `avatars/${userId}/avatar.${fileExt}`;
    
    return this.uploadFile(path, file, {
      contentType: file.type,
      metadata: {
        'user-id': userId,
        'uploaded-at': new Date().toISOString(),
      },
    });
  }

  /**
   * Get public URL for a file (no signing required for public files)
   */
  getPublicUrl(path: string, bucket?: string): string {
    const bucketName = bucket || this.config.uploadsBucket;
    return `https://${bucketName}.s3.${this.config.region}.amazonaws.com/${path}`;
  }
}

// Export singleton instance
export const s3Storage = new S3StorageService();
export { S3StorageService };
export type { UploadOptions };