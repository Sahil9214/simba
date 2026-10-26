/**
 * Upload Error Boundary
 * Specialized error boundary for file upload errors with upload-specific recovery
 */

import React from 'react';
import { BaseErrorBoundary } from './BaseErrorBoundary';
import { ErrorBoundaryProps } from './types';
import {
  Upload,
  FileX,
  AlertTriangle,
  RefreshCw,
  File,
  CheckCircle,
  X,
  FileText,
  Image,
  Archive
} from 'lucide-react';

interface UploadErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'level'> {
  uploadType?: 'single' | 'multiple' | 'batch';
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  onUploadRetry?: (files?: File[]) => void;
  onUploadCancel?: () => void;
  currentFiles?: File[];
  uploadProgress?: number;
}

export function UploadErrorBoundary({
  children,
  uploadType = 'single',
  acceptedFileTypes = [],
  maxFileSize,
  onUploadRetry,
  onUploadCancel,
  currentFiles = [],
  uploadProgress = 0,
  ...props
}: UploadErrorBoundaryProps) {
  const handleUploadError = (errorDetails: any, errorInfo: any) => {
    // Upload-specific error logging
    console.error('Upload Error:', {
      uploadType,
      acceptedFileTypes,
      maxFileSize,
      currentFiles: currentFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      uploadProgress,
      error: errorDetails
    });

    // Call parent error handler if provided
    if (props.onError) {
      props.onError(errorDetails, errorInfo);
    }
  };

  const createUploadFallback = (errorDetails: any, retry: () => void) => {
    return (
      <UploadErrorFallback
        errorDetails={errorDetails}
        uploadType={uploadType}
        acceptedFileTypes={acceptedFileTypes}
        maxFileSize={maxFileSize}
        currentFiles={currentFiles}
        uploadProgress={uploadProgress}
        onRetry={retry}
        onUploadRetry={onUploadRetry}
        onUploadCancel={onUploadCancel}
      />
    );
  };

  return (
    <BaseErrorBoundary
      {...props}
      level="component"
      fallback={createUploadFallback}
      onError={handleUploadError}
      retryConfig={{
        maxAttempts: 3,
        strategy: 'linear',
        baseDelay: 2000,
        maxDelay: 8000,
        backoffMultiplier: 1.5
      }}
    >
      {children}
    </BaseErrorBoundary>
  );
}

interface UploadErrorFallbackProps {
  errorDetails: any;
  uploadType: string;
  acceptedFileTypes: string[];
  maxFileSize?: number;
  currentFiles: File[];
  uploadProgress: number;
  onRetry: () => void;
  onUploadRetry?: (files?: File[]) => void;
  onUploadCancel?: () => void;
}

function UploadErrorFallback({
  errorDetails,
  uploadType,
  acceptedFileTypes,
  maxFileSize,
  currentFiles,
  uploadProgress,
  onRetry,
  onUploadRetry,
  onUploadCancel
}: UploadErrorFallbackProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>(currentFiles);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getUploadErrorType = () => {
    const message = errorDetails?.message?.toLowerCase() || '';

    if (message.includes('size') || message.includes('large')) return 'fileSize';
    if (message.includes('type') || message.includes('format')) return 'fileType';
    if (message.includes('network') || message.includes('timeout')) return 'network';
    if (message.includes('quota') || message.includes('limit')) return 'quota';
    if (message.includes('corrupt') || message.includes('invalid')) return 'corruption';
    return 'generic';
  };

  const getErrorMessage = () => {
    const errorType = getUploadErrorType();

    switch (errorType) {
      case 'fileSize':
        return `File size exceeds the maximum limit${maxFileSize ? ` of ${formatFileSize(maxFileSize)}` : ''}.`;
      case 'fileType':
        return `File type not supported. ${acceptedFileTypes.length > 0 ? `Accepted types: ${acceptedFileTypes.join(', ')}` : ''}`;
      case 'network':
        return 'Upload failed due to network issues. Please check your connection and try again.';
      case 'quota':
        return 'Upload quota exceeded. Please try again later or contact support.';
      case 'corruption':
        return 'The file appears to be corrupted or invalid. Please try a different file.';
      default:
        return 'Upload failed due to an unexpected error. Please try again.';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    {/* eslint-disable-next-line jsx-a11y/alt-text */}
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="h-4 w-4 text-red-500" />;
    if (file.type.includes('zip') || file.type.includes('archive')) return <Archive className="h-4 w-4 text-yellow-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleRetryWithFiles = () => {
    if (onUploadRetry) {
      onUploadRetry(selectedFiles);
    } else {
      onRetry();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const isFileSizeValid = (file: File) => {
    return !maxFileSize || file.size <= maxFileSize;
  };

  const isFileTypeValid = (file: File) => {
    return acceptedFileTypes.length === 0 || acceptedFileTypes.some(type =>
      file.type.includes(type) || file.name.toLowerCase().endsWith(type.toLowerCase())
    );
  };

  return (
    <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-8">
      <div className="text-center">
        {/* Upload Icon */}
        <div className="mb-4 flex justify-center">
          <FileX className="h-16 w-16 text-red-500" />
        </div>

        {/* Title */}
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Upload Failed
        </h4>

        {/* Error Message */}
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          {getErrorMessage()}
        </p>

        {/* Upload Progress (if in progress) */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-6 max-w-sm mx-auto">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Upload Progress</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Files */}
        {currentFiles.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Failed Files:</h5>
            <div className="space-y-2 max-w-md mx-auto">
              {currentFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className="text-sm text-gray-900 truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Reselection */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple={uploadType !== 'single'}
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Upload className="h-4 w-4" />
            Select {uploadType === 'single' ? 'File' : 'Files'}
          </button>
        </div>

        {/* Selected Files for Retry */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Selected for Retry:</h5>
            <div className="space-y-2 max-w-md mx-auto">
              {selectedFiles.map((file, index) => {
                const sizeValid = isFileSizeValid(file);
                const typeValid = isFileTypeValid(file);
                const isValid = sizeValid && typeValid;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 border rounded-lg ${
                      isValid
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(file)}
                      <span className="text-sm text-gray-900 truncate max-w-[150px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Requirements */}
        {(acceptedFileTypes.length > 0 || maxFileSize) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Upload Requirements:</h5>
            <ul className="text-xs text-blue-800 space-y-1 text-left">
              {acceptedFileTypes.length > 0 && (
                <li>• Accepted types: {acceptedFileTypes.join(', ')}</li>
              )}
              {maxFileSize && (
                <li>• Maximum size: {formatFileSize(maxFileSize)}</li>
              )}
              {uploadType === 'multiple' && (
                <li>• Multiple files allowed</li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={handleRetryWithFiles}
            disabled={selectedFiles.length === 0 || !selectedFiles.every(f => isFileSizeValid(f) && isFileTypeValid(f))}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Upload
          </button>

          {onUploadCancel && (
            <button
              onClick={onUploadCancel}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-4 text-xs text-gray-500">
          If uploads continue to fail, try using a different file or contact support.
        </p>
      </div>
    </div>
  );
}

// HOC for upload components
export function withUploadErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    uploadType?: 'single' | 'multiple' | 'batch';
    acceptedFileTypes?: string[];
    maxFileSize?: number;
  }
) {
  return function WrappedUploadComponent(props: P) {
    return (
      <UploadErrorBoundary {...options}>
        <Component {...props} />
      </UploadErrorBoundary>
    );
  };
}