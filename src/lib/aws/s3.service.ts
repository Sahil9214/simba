/**
 * AWS S3 Storage Service
 * Complete replacement for Supabase Storage
 * Handles all file uploads, downloads, and management for Simba Analytics
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * S3 Bucket configuration
 * All buckets are prefixed paths in a single S3 bucket
 */
export const S3_BUCKETS = {
  UPLOADS: 'uploads',
  GOVERNMENT_REPORTS: 'government-reports',
  DAILY_STOCK_PHOTOS: 'daily-stock-photos',
  PROFILE_IMAGES: 'profile-images',
  PROCESSED_FILES: 'processed-files'
} as const

export type S3BucketKey = keyof typeof S3_BUCKETS

interface S3UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  cacheControl?: string
  upsert?: boolean
}

interface S3FileMetadata {
  name: string
  size: number
  lastModified: string
  contentType?: string
  metadata?: Record<string, string>
}

/**
 * S3 Storage Service
 * Provides unified interface for all S3 operations
 */
export class S3Service {
  private client: S3Client
  private bucketName: string
  private region: string

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1'
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'simba-analytics-uploads'

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY')
    }

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      maxAttempts: 3
    })
  }

  /**
   * Get full S3 key with bucket prefix
   */
  private getFullKey(bucket: S3BucketKey, path: string): string {
    const bucketPrefix = S3_BUCKETS[bucket]
    return `${bucketPrefix}/${path}`
  }

  /**
   * Upload file to S3
   * @param bucket - Bucket key (e.g., 'UPLOADS', 'GOVERNMENT_REPORTS')
   * @param path - File path within bucket
   * @param file - File object or Buffer
   * @param options - Upload options
   * @returns Promise with path and URL
   */
  async uploadFile(
    bucket: S3BucketKey,
    path: string,
    file: File | Buffer,
    options: S3UploadOptions = {}
  ): Promise<{ path: string; url: string }> {
    try {
      const fullKey = this.getFullKey(bucket, path)

      let body: Buffer
      let contentType: string

      if (file instanceof File) {
        body = Buffer.from(await file.arrayBuffer())
        contentType = options.contentType || file.type
      } else {
        body = file
        contentType = options.contentType || 'application/octet-stream'
      }

      // Check if file exists and upsert is false
      if (!options.upsert) {
        try {
          await this.client.send(new HeadObjectCommand({
            Bucket: this.bucketName,
            Key: fullKey
          }))
          // File exists and upsert is false
          throw new Error(`File already exists: ${path}`)
        } catch (error: any) {
          // File doesn't exist (404), proceed with upload
          if (error.name !== 'NotFound') {
            throw error
          }
        }
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fullKey,
        Body: body,
        ContentType: contentType,
        Metadata: options.metadata,
        CacheControl: options.cacheControl || '3600'
      })

      await this.client.send(command)

      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fullKey}`

      return {
        path: fullKey,
        url
      }
    } catch (error) {
      console.error('S3 upload error:', error)
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get signed URL for private file access
   * @param bucket - Bucket key
   * @param path - File path
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Promise with signed URL
   */
  async getSignedUrl(
    bucket: S3BucketKey,
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const fullKey = this.getFullKey(bucket, path)

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fullKey
      })

      const signedUrl = await getSignedUrl(this.client, command, {
        expiresIn
      })

      return signedUrl
    } catch (error) {
      console.error('S3 signed URL error:', error)
      throw new Error(`Failed to get signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get public URL for file (assumes bucket is public or file is public)
   * @param bucket - Bucket key
   * @param path - File path
   * @returns Public URL
   */
  getPublicUrl(bucket: S3BucketKey, path: string): string {
    const fullKey = this.getFullKey(bucket, path)
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fullKey}`
  }

  /**
   * Delete a file from S3
   * @param bucket - Bucket key
   * @param path - File path
   * @returns Promise<void>
   */
  async deleteFile(bucket: S3BucketKey, path: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(bucket, path)

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fullKey
      })

      await this.client.send(command)
    } catch (error) {
      console.error('S3 delete error:', error)
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete multiple files from S3
   * @param bucket - Bucket key
   * @param paths - Array of file paths
   * @returns Promise<void>
   */
  async deleteFiles(bucket: S3BucketKey, paths: string[]): Promise<void> {
    try {
      const fullKeys = paths.map(path => this.getFullKey(bucket, path))

      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: fullKeys.map(key => ({ Key: key }))
        }
      })

      await this.client.send(command)
    } catch (error) {
      console.error('S3 bulk delete error:', error)
      throw new Error(`Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List files in a directory
   * @param bucket - Bucket key
   * @param directory - Directory path (prefix)
   * @param limit - Maximum number of files to return
   * @returns Promise with array of file metadata
   */
  async listFiles(
    bucket: S3BucketKey,
    directory: string = '',
    limit: number = 100
  ): Promise<S3FileMetadata[]> {
    try {
      const fullPrefix = this.getFullKey(bucket, directory)

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: fullPrefix,
        MaxKeys: limit
      })

      const response = await this.client.send(command)

      if (!response.Contents) {
        return []
      }

      return response.Contents.map(item => ({
        name: item.Key?.replace(fullPrefix, '') || '',
        size: item.Size || 0,
        lastModified: item.LastModified?.toISOString() || new Date().toISOString(),
        contentType: undefined,
        metadata: undefined
      }))
    } catch (error) {
      console.error('S3 list error:', error)
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get file metadata
   * @param bucket - Bucket key
   * @param path - File path
   * @returns Promise with file metadata
   */
  async getFileMetadata(
    bucket: S3BucketKey,
    path: string
  ): Promise<S3FileMetadata> {
    try {
      const fullKey = this.getFullKey(bucket, path)

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fullKey
      })

      const response = await this.client.send(command)

      return {
        name: path.split('/').pop() || path,
        size: response.ContentLength || 0,
        lastModified: response.LastModified?.toISOString() || new Date().toISOString(),
        contentType: response.ContentType,
        metadata: response.Metadata
      }
    } catch (error) {
      console.error('S3 metadata error:', error)
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Copy file within S3
   * @param sourceBucket - Source bucket key
   * @param sourcePath - Source file path
   * @param destBucket - Destination bucket key
   * @param destPath - Destination file path
   * @returns Promise<void>
   */
  async copyFile(
    sourceBucket: S3BucketKey,
    sourcePath: string,
    destBucket: S3BucketKey,
    destPath: string
  ): Promise<void> {
    try {
      const sourceKey = this.getFullKey(sourceBucket, sourcePath)
      const destKey = this.getFullKey(destBucket, destPath)

      const command = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destKey
      })

      await this.client.send(command)
    } catch (error) {
      console.error('S3 copy error:', error)
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if file exists
   * @param bucket - Bucket key
   * @param path - File path
   * @returns Promise<boolean>
   */
  async fileExists(bucket: S3BucketKey, path: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(bucket, path)

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fullKey
      })

      await this.client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false
      }
      throw error
    }
  }

  /**
   * Download file from S3 as Buffer
   * @param bucket - Bucket key
   * @param path - File path
   * @returns Promise<Buffer>
   */
  async downloadFileAsBuffer(bucket: S3BucketKey, path: string): Promise<Buffer> {
    try {
      const fullKey = this.getFullKey(bucket, path)

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fullKey
      })

      const response = await this.client.send(command)

      if (!response.Body) {
        throw new Error('No file content received from S3')
      }

      // Convert stream to buffer
      const stream = response.Body as any
      const chunks: Uint8Array[] = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      return Buffer.concat(chunks)
    } catch (error: any) {
      console.error('S3 download error:', error)
      if (error.name === 'NoSuchKey') {
        throw new Error(`File not found in S3: ${path}`)
      }
      throw new Error(`Failed to download file from S3: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Parse S3 path from URL or path string
   * @param urlOrPath - S3 URL or path
   * @returns {bucket, path} or null if invalid
   */
  static parseS3Path(urlOrPath: string): { bucket: S3BucketKey; path: string } | null {
    try {
      // Handle full S3 URLs
      if (urlOrPath.includes('s3.amazonaws.com') || urlOrPath.includes('s3.')) {
        const url = new URL(urlOrPath)
        const pathname = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
        
        // Extract bucket prefix and path
        for (const [key, prefix] of Object.entries(S3_BUCKETS)) {
          if (pathname.startsWith(prefix + '/')) {
            const path = pathname.replace(prefix + '/', '')
            return { bucket: key as S3BucketKey, path }
          }
        }
      }
      
      // Handle relative paths
      for (const [key, prefix] of Object.entries(S3_BUCKETS)) {
        if (urlOrPath.startsWith(prefix + '/')) {
          const path = urlOrPath.replace(prefix + '/', '')
          return { bucket: key as S3BucketKey, path }
        }
      }

      return null
    } catch (error) {
      console.error('Failed to parse S3 path:', error)
      return null
    }
  }

  /**
   * Upload file for OCR processing
   * @param file - File to upload
   * @param sessionId - Upload session ID
   * @returns Promise with path and URL
   */
  async uploadForOCR(file: File | Buffer, sessionId: string): Promise<{ path: string; url: string }> {
    const timestamp = Date.now()
    const fileName = file instanceof File ? file.name : 'document'
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `session_${sessionId}/${timestamp}_${sanitizedFileName}`

    return this.uploadFile('UPLOADS', path, file, {
      metadata: {
        sessionId,
        uploadedAt: new Date().toISOString(),
        purpose: 'ocr-processing'
      }
    })
  }

  /**
   * Upload profile image
   * @param userId - User ID
   * @param file - Image file
   * @returns Promise with path and URL
   */
  async uploadProfileImage(userId: string, file: File): Promise<{ path: string; url: string }> {
    const fileExt = file.name.split('.').pop()
    const path = `${userId}.${fileExt}`

    return this.uploadFile('PROFILE_IMAGES', path, file, {
      contentType: file.type,
      upsert: true,
      metadata: {
        userId,
        uploadedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Upload daily stock photo
   * @param shopId - Shop ID
   * @param stockId - Stock record ID
   * @param file - Image file
   * @returns Promise with path and URL
   */
  async uploadDailyStockPhoto(
    shopId: string,
    stockId: string,
    file: File
  ): Promise<{ path: string; url: string }> {
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const path = `${shopId}/${stockId}_${timestamp}.${fileExt}`

    return this.uploadFile('DAILY_STOCK_PHOTOS', path, file, {
      contentType: file.type,
      metadata: {
        shopId,
        stockId,
        uploadedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Upload government report
   * @param file - Report file
   * @returns Promise with path and URL
   */
  async uploadGovernmentReport(file: File): Promise<{ path: string; url: string }> {
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `reports/${timestamp}_${sanitizedFileName}`

    return this.uploadFile('GOVERNMENT_REPORTS', path, file, {
      contentType: file.type,
      metadata: {
        originalFileName: file.name,
        uploadedAt: new Date().toISOString()
      }
    })
  }
}

// Export singleton instance
export const s3Service = new S3Service()
