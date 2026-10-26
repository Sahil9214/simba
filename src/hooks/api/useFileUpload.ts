import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FileUploadClientService } from '@/lib/services/fileUpload.client'
import { FileUploadService } from '@/lib/services/fileUpload.service'
import { useState } from 'react'
import { FILE_UPLOAD_KEYS } from '@/lib/query/keys'

/**
 * Hook for uploading government reports with progress tracking
 * @returns Mutation object with progress tracking
 *
 * @example
 * ```tsx
 * const { mutate: uploadReport, isPending, progress } = useUploadGovernmentReport()
 *
 * const handleUpload = (file: File) => {
 *   uploadReport({ file, uploadedBy: userId }, {
 *     onSuccess: ({ uploadSession, fileUrl }) => {
 *       console.log('Upload complete:', fileUrl)
 *     }
 *   })
 * }
 * ```
 */
export const useUploadGovernmentReport = () => {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)

  return {
    ...useMutation({
      mutationFn: async ({ file, uploadedBy }: { file: File; uploadedBy: string }) => {
        // Validate file
        if (!FileUploadClientService.validateFileType(file, [...FileUploadClientService.ALLOWED_FILE_TYPES.GOVERNMENT_REPORTS])) {
          throw new Error('Invalid file type. Please upload PDF, Excel, Word, or CSV files.')
        }

        if (!FileUploadClientService.validateFileSize(file, FileUploadClientService.MAX_FILE_SIZES.GOVERNMENT_REPORTS)) {
          throw new Error('File size too large. Maximum size is 50MB.')
        }

        setProgress(10)
        const result = await FileUploadClientService.uploadGovernmentReport(file, uploadedBy)
        setProgress(100)

        return result
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: FILE_UPLOAD_KEYS.uploadSessions() })
        toast.success(`File "${data.uploadSession.filename}" uploaded successfully`)
        setProgress(0)
      },
      onError: (error: any) => {
        const message = error?.message || 'Failed to upload file'
        toast.error(message)
        setProgress(0)
      },
    }),
    progress
  }
}

/**
 * Hook for uploading daily stock photos
 * @returns Mutation object for photo uploads
 *
 * @example
 * ```tsx
 * const uploadPhotoMutation = useUploadDailyStockPhoto()
 *
 * const handlePhotoUpload = (file: File, stockId: string, shopId: string) => {
 *   uploadPhotoMutation.mutate({ file, stockId, shopId })
 * }
 * ```
 */
export const useUploadDailyStockPhoto = () => {
  return useMutation({
    mutationFn: ({ file, stockId, shopId }: { file: File; stockId: string; shopId: string }) => {
      // Validate file
      if (!FileUploadClientService.validateFileType(file, [...FileUploadClientService.ALLOWED_FILE_TYPES.IMAGES])) {
        throw new Error('Invalid file type. Please upload an image file.')
      }

      if (!FileUploadClientService.validateFileSize(file, FileUploadClientService.MAX_FILE_SIZES.DAILY_STOCK_PHOTOS)) {
        throw new Error('File size too large. Maximum size is 10MB.')
      }

      return FileUploadClientService.uploadDailyStockPhoto(file, stockId, shopId)
    },
    onSuccess: (data) => {
      toast.success('Photo uploaded successfully')
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to upload photo'
      toast.error(message)
    },
  })
}

/**
 * Hook for uploading profile images
 * @returns Mutation object for profile image uploads
 *
 * @example
 * ```tsx
 * const uploadProfileMutation = useUploadProfileImage()
 *
 * const handleProfileUpload = (file: File, userId: string) => {
 *   uploadProfileMutation.mutate({ file, userId })
 * }
 * ```
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) => {
      // Validate file
      if (!FileUploadClientService.validateFileType(file, [...FileUploadClientService.ALLOWED_FILE_TYPES.PROFILE_IMAGES])) {
        throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images.')
      }

      if (!FileUploadClientService.validateFileSize(file, FileUploadClientService.MAX_FILE_SIZES.PROFILE_IMAGES)) {
        throw new Error('File size too large. Maximum size is 5MB.')
      }

      return FileUploadClientService.uploadProfileImage(file, userId)
    },
    onSuccess: (data) => {
      // Invalidate user profile queries
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      toast.success('Profile image updated successfully')
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to upload profile image'
      toast.error(message)
    },
  })
}

/**
 * Hook to get an upload session
 * @param sessionId - Upload session ID
 * @returns Query result with upload session data
 *
 * @example
 * ```tsx
 * const { data: session, isLoading } = useUploadSession(sessionId)
 * ```
 */
export const useUploadSession = (sessionId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: FILE_UPLOAD_KEYS.uploadSession(sessionId),
    queryFn: () => FileUploadClientService.getUploadSession(sessionId),
    enabled: enabled && !!sessionId,
    staleTime: 30 * 1000, // 30 seconds (upload sessions change frequently)
  })
}

/**
 * Hook to list files in a storage bucket
 * @param bucket - Storage bucket name
 * @param directory - Directory to list files from
 * @returns Query result with file list
 *
 * @example
 * ```tsx
 * const { data: files } = useListFiles('GOVERNMENT_REPORTS', 'reports/')
 * ```
 */
export const useListFiles = (
  bucket: keyof typeof FileUploadService['BUCKETS'],
  directory?: string
) => {
  return useQuery({
    queryKey: FILE_UPLOAD_KEYS.files(bucket, directory),
    queryFn: () => FileUploadClientService.listFiles(bucket, directory),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to delete a file from storage
 * @returns Mutation object for file deletion
 *
 * @example
 * ```tsx
 * const deleteFileMutation = useDeleteFile()
 *
 * const handleDelete = (bucket: string, path: string) => {
 *   deleteFileMutation.mutate({ bucket, path })
 * }
 * ```
 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bucket, path }: {
      bucket: keyof typeof FileUploadService['BUCKETS'];
      path: string
    }) => FileUploadClientService.deleteFile(bucket, path),
    onSuccess: () => {
      // Invalidate file lists
      queryClient.invalidateQueries({ queryKey: FILE_UPLOAD_KEYS.all() })
      toast.success('File deleted successfully')
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete file'
      toast.error(message)
    },
  })
}

/**
 * Hook to get a signed URL for file access
 * @returns Mutation object for getting signed URLs
 *
 * @example
 * ```tsx
 * const getSignedUrlMutation = useGetSignedUrl()
 *
 * const handleGetUrl = (bucket: string, path: string) => {
 *   getSignedUrlMutation.mutate({ bucket, path, expiresIn: 3600 })
 * }
 * ```
 */
export const useGetSignedUrl = () => {
  return useMutation({
    mutationFn: ({ bucket, path, expiresIn = 3600 }: {
      bucket: keyof typeof FileUploadService['BUCKETS'];
      path: string;
      expiresIn?: number;
    }) => FileUploadClientService.getSignedUrl(bucket, path, expiresIn),
    onError: (error: any) => {
      const message = error?.message || 'Failed to generate file URL'
      toast.error(message)
    },
  })
}

/**
 * Hook to update upload session status
 * @returns Mutation object for updating session status
 *
 * @example
 * ```tsx
 * const updateSessionMutation = useUpdateUploadSessionStatus()
 *
 * const handleUpdateStatus = (sessionId: string, status: string) => {
 *   updateSessionMutation.mutate({ sessionId, status })
 * }
 * ```
 */
export const useUpdateUploadSessionStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, status, progress }: {
      sessionId: string;
      status: 'uploaded' | 'processing' | 'completed' | 'failed';
      progress?: {
        total_records?: number;
        processed_records?: number;
        successful_records?: number;
        failed_records?: number;
        error_summary?: any;
      };
    }) => FileUploadClientService.updateUploadSessionStatus(sessionId, status, progress),
    onSuccess: (_, { sessionId }) => {
      // Invalidate the specific upload session
      queryClient.invalidateQueries({ queryKey: FILE_UPLOAD_KEYS.uploadSession(sessionId) })
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update upload status'
      toast.error(message)
    },
  })
}

/**
 * Custom hook for drag and drop file upload with validation
 * @param onFilesSelected - Callback when files are selected
 * @param accept - Accepted file types
 * @param maxFiles - Maximum number of files
 * @returns Drag and drop handlers and state
 *
 * @example
 * ```tsx
 * const {
 *   isDragOver,
 *   handleDragOver,
 *   handleDragLeave,
 *   handleDrop,
 *   handleFileSelect
 * } = useDragAndDrop(
 *   (files) => console.log('Files selected:', files),
 *   FileUploadService.ALLOWED_FILE_TYPES.GOVERNMENT_REPORTS,
 *   5
 * )
 * ```
 */
export const useDragAndDrop = (
  onFilesSelected: (files: File[]) => void,
  accept: string[],
  maxFiles: number = 10
) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const validateFiles = (files: FileList | File[]): File[] => {
    const fileArray = Array.from(files)

    if (fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return []
    }

    const validFiles = fileArray.filter(file => {
      if (!accept.includes(file.type)) {
        toast.error(`File "${file.name}" has invalid type`)
        return false
      }
      return true
    })

    return validFiles
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    const validFiles = validateFiles(files)

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const validFiles = validateFiles(files)
    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }

    // Reset input
    e.target.value = ''
  }

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect
  }
}
