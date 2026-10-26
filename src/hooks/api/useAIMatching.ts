import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState, useCallback, useRef, useEffect } from 'react'
import { OCRClientService, OCRResult, OCRProcessingSession, OCROptions } from '@/lib/services/ocr.client'
import {
  FuzzyMatchingClientService,
  FuzzyMatchResponse,
  MatchingOptions,
  MatchResult
} from '@/lib/services/fuzzyMatching.client'

// Query keys for consistent caching
export const aiMatchingKeys = {
  all: ['ai-matching'] as const,
  ocrResults: () => [...aiMatchingKeys.all, 'ocr-results'] as const,
  ocrResult: (id: string) => [...aiMatchingKeys.ocrResults(), id] as const,
  ocrSession: (sessionId: string) => [...aiMatchingKeys.all, 'ocr-session', sessionId] as const,
  matchResults: () => [...aiMatchingKeys.all, 'match-results'] as const,
  matchResult: (query: string, entityType: string) => [...aiMatchingKeys.matchResults(), query, entityType] as const,
  reviewQueue: () => [...aiMatchingKeys.all, 'review-queue'] as const,
  reviewItem: (id: string) => [...aiMatchingKeys.reviewQueue(), id] as const,
  trainingData: () => [...aiMatchingKeys.all, 'training-data'] as const,
  matchingStats: (entityType?: string) => [...aiMatchingKeys.all, 'stats', entityType] as const,
}

// Interface for review queue items
export interface ReviewQueueItem {
  id: string
  uploadSessionId: string
  originalImageUrl: string
  extractedText: string
  suggestedMatches: {
    entity: string
    entityType: 'sku' | 'shop' | 'brand'
    confidence: number
    alternatives: MatchResult[]
  }[]
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface AIProcessingProgress {
  stage: 'ocr' | 'matching' | 'reviewing' | 'completed'
  progress: number
  message: string
  error?: string
}

/**
 * Hook for OCR processing with progress tracking
 * @param options - OCR processing options
 * @returns OCR processing mutation with progress
 *
 * @example
 * ```tsx
 * const { mutate: processOCR, isPending, progress } = useOCRProcessing()
 *
 * const handleProcess = (file: File) => {
 *   processOCR({ file, options: { preprocessImage: true } })
 * }
 * ```
 */
export const useOCRProcessing = () => {
  const [progress, setProgress] = useState<AIProcessingProgress>({
    stage: 'ocr',
    progress: 0,
    message: 'Initializing...'
  })
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options?: OCROptions }) => {
      setProgress({ stage: 'ocr', progress: 10, message: 'Uploading file...' })

      const result = await OCRClientService.processImage(file, options)

      setProgress({ stage: 'ocr', progress: 100, message: 'OCR processing completed' })

      return result
    },
    onSuccess: (result) => {
      // Invalidate OCR results cache
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.ocrResults() })
      toast.success('OCR processing completed successfully')

      // Reset progress after delay
      setTimeout(() => {
        setProgress({ stage: 'ocr', progress: 0, message: 'Ready' })
      }, 2000)
    },
    onError: (error: any) => {
      const message = error?.message || 'OCR processing failed'
      setProgress({
        stage: 'ocr',
        progress: 0,
        message: 'Failed',
        error: message
      })
      toast.error(message)
    },
  })

  return {
    ...mutation,
    progress
  }
}

/**
 * Hook for batch OCR processing
 * @returns Batch OCR processing mutation
 *
 * @example
 * ```tsx
 * const batchOCRMutation = useBatchOCRProcessing()
 *
 * const handleBatchProcess = (files: File[]) => {
 *   batchOCRMutation.mutate({ files, options: { preprocessImage: true } })
 * }
 * ```
 */
export const useBatchOCRProcessing = () => {
  const [progress, setProgress] = useState<AIProcessingProgress>({
    stage: 'ocr',
    progress: 0,
    message: 'Ready'
  })
  const queryClient = useQueryClient()

  return {
    ...useMutation({
      mutationFn: async ({ files, options }: { files: File[]; options?: OCROptions }) => {
        setProgress({
          stage: 'ocr',
          progress: 0,
          message: `Processing ${files.length} files...`
        })

        const results: OCRResult[] = []
        const total = files.length

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          setProgress({
            stage: 'ocr',
            progress: (i / total) * 100,
            message: `Processing ${file.name}... (${i + 1}/${total})`
          })

          try {
            const result = await OCRClientService.processImage(file, options)
            results.push(result)
          } catch (error) {
            console.error(`Failed to process ${file.name}:`, error)
          }
        }

        setProgress({
          stage: 'ocr',
          progress: 100,
          message: `Completed processing ${results.length}/${total} files`
        })

        return results
      },
      onSuccess: (results) => {
        queryClient.invalidateQueries({ queryKey: aiMatchingKeys.ocrResults() })
        toast.success(`Batch OCR completed: ${results.length} files processed`)
      },
      onError: (error: any) => {
        const message = error?.message || 'Batch OCR processing failed'
        setProgress({
          stage: 'ocr',
          progress: 0,
          message: 'Failed',
          error: message
        })
        toast.error(message)
      },
    }),
    progress
  }
}

/**
 * Hook to get OCR result by ID
 * @param resultId - OCR result ID
 * @returns OCR result data
 *
 * @example
 * ```tsx
 * const { data: ocrResult, isLoading } = useOCRResult(resultId)
 * ```
 */
export const useOCRResult = (resultId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: aiMatchingKeys.ocrResult(resultId),
    queryFn: () => OCRClientService.getOCRResult(resultId),
    enabled: enabled && !!resultId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for OCR processing session management
 * @param sessionId - Processing session ID
 * @returns Session data and management functions
 *
 * @example
 * ```tsx
 * const { data: session, updateStatus } = useOCRProcessingSession(sessionId)
 * ```
 */
export const useOCRProcessingSession = (sessionId: string) => {
  const queryClient = useQueryClient()

  const sessionQuery = useQuery({
    queryKey: aiMatchingKeys.ocrSession(sessionId),
    queryFn: () => OCRClientService.getProcessingSession(sessionId),
    enabled: !!sessionId,
    refetchInterval: 5000, // Poll every 5 seconds for active sessions
    staleTime: 1000, // Very short stale time for real-time updates
  })

  const updateStatusMutation = useMutation({
    mutationFn: (updates: Partial<OCRProcessingSession>) =>
      OCRClientService.updateProcessingSession(sessionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.ocrSession(sessionId) })
    },
    onError: (error: any) => {
      toast.error(`Failed to update session: ${error.message}`)
    }
  })

  return {
    data: sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  }
}

/**
 * Hook for fuzzy matching against SKUs
 * @returns SKU matching mutation
 *
 * @example
 * ```tsx
 * const skuMatchMutation = useFuzzyMatchSKU()
 *
 * const handleMatch = (query: string) => {
 *   skuMatchMutation.mutate({ query, options: { threshold: 0.7 } })
 * }
 * ```
 */
export const useFuzzyMatchSKU = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ query, options }: { query: string; options?: MatchingOptions }) => {
      return await FuzzyMatchingClientService.matchSKU(query, options)
    },
    onSuccess: (result, { query }) => {
      // Cache the result
      queryClient.setQueryData(
        aiMatchingKeys.matchResult(query, 'sku'),
        result
      )

      if (result.results.length > 0) {
        toast.success(`Found ${result.results.length} SKU matches`)
      } else {
        toast.info('No SKU matches found')
      }
    },
    onError: (error: any) => {
      toast.error(`SKU matching failed: ${error.message}`)
    }
  })
}

/**
 * Hook for fuzzy matching against shops
 * @returns Shop matching mutation
 */
export const useFuzzyMatchShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ query, options }: { query: string; options?: MatchingOptions }) => {
      return await FuzzyMatchingClientService.matchShop(query, options)
    },
    onSuccess: (result, { query }) => {
      queryClient.setQueryData(
        aiMatchingKeys.matchResult(query, 'shop'),
        result
      )

      if (result.results.length > 0) {
        toast.success(`Found ${result.results.length} shop matches`)
      } else {
        toast.info('No shop matches found')
      }
    },
    onError: (error: any) => {
      toast.error(`Shop matching failed: ${error.message}`)
    }
  })
}

/**
 * Hook for fuzzy matching against brands
 * @returns Brand matching mutation
 */
export const useFuzzyMatchBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ query, options }: { query: string; options?: MatchingOptions }) => {
      return await FuzzyMatchingClientService.matchBrand(query, options)
    },
    onSuccess: (result, { query }) => {
      queryClient.setQueryData(
        aiMatchingKeys.matchResult(query, 'brand'),
        result
      )

      if (result.results.length > 0) {
        toast.success(`Found ${result.results.length} brand matches`)
      } else {
        toast.info('No brand matches found')
      }
    },
    onError: (error: any) => {
      toast.error(`Brand matching failed: ${error.message}`)
    }
  })
}

/**
 * Hook for batch fuzzy matching
 * @returns Batch matching mutation
 *
 * @example
 * ```tsx
 * const batchMatchMutation = useBatchFuzzyMatch()
 *
 * const handleBatchMatch = (queries: string[], entityType: 'sku' | 'shop' | 'brand') => {
 *   batchMatchMutation.mutate({ queries, entityType })
 * }
 * ```
 */
export const useBatchFuzzyMatch = () => {
  const [progress, setProgress] = useState(0)
  const queryClient = useQueryClient()

  return {
    ...useMutation({
      mutationFn: async ({
        queries,
        entityType,
        options
      }: {
        queries: string[];
        entityType: 'sku' | 'shop' | 'brand';
        options?: MatchingOptions
      }) => {
        setProgress(0)

        const results = await FuzzyMatchingClientService.batchMatch(queries, entityType, options)

        // Cache individual results
        results.forEach((result, index) => {
          queryClient.setQueryData(
            aiMatchingKeys.matchResult(queries[index], entityType),
            result
          )
        })

        setProgress(100)
        return results
      },
      onSuccess: (results) => {
        const totalMatches = results.reduce((sum, result) => sum + result.results.length, 0)
        toast.success(`Batch matching completed: ${totalMatches} total matches found`)
        setTimeout(() => setProgress(0), 2000)
      },
      onError: (error: any) => {
        toast.error(`Batch matching failed: ${error.message}`)
        setProgress(0)
      }
    }),
    progress
  }
}

/**
 * Hook to get cached match result
 * @param query - Search query
 * @param entityType - Type of entity to match
 * @returns Cached match result if available
 */
export const useCachedMatchResult = (query: string, entityType: 'sku' | 'shop' | 'brand') => {
  return useQuery({
    queryKey: aiMatchingKeys.matchResult(query, entityType),
    queryFn: () => null, // Never fetch, only use cached data
    enabled: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for managing review queue
 * @returns Review queue data and management functions
 *
 * @example
 * ```tsx
 * const { data: reviewItems, assignToMe, approveItem } = useReviewQueue()
 * ```
 */
export const useReviewQueue = (filters?: {
  status?: 'pending' | 'in_review' | 'approved' | 'rejected'
  priority?: 'high' | 'medium' | 'low'
  assignedTo?: string
}) => {
  const queryClient = useQueryClient()

  // Mock implementation - would integrate with actual review queue API
  const reviewQueueQuery = useQuery({
    queryKey: [...aiMatchingKeys.reviewQueue(), filters],
    queryFn: async () => {
      // This would be implemented with actual Supabase queries
      return [] as ReviewQueueItem[]
    },
    staleTime: 30 * 1000, // 30 seconds
  })

  const assignToMeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // Implement assignment logic
      //console.log('Assigning item to current user:', itemId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.reviewQueue() })
      toast.success('Item assigned to you')
    }
  })

  const approveItemMutation = useMutation({
    mutationFn: async ({ itemId, corrections }: { itemId: string; corrections?: any }) => {
      // Implement approval logic with optional corrections
      //console.log('Approving item:', itemId, corrections)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.reviewQueue() })
      toast.success('Item approved')
    }
  })

  const rejectItemMutation = useMutation({
    mutationFn: async ({ itemId, reason }: { itemId: string; reason: string }) => {
      // Implement rejection logic
      //console.log('Rejecting item:', itemId, reason)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.reviewQueue() })
      toast.success('Item rejected')
    }
  })

  return {
    data: reviewQueueQuery.data || [],
    isLoading: reviewQueueQuery.isLoading,
    error: reviewQueueQuery.error,
    assignToMe: assignToMeMutation.mutate,
    approveItem: approveItemMutation.mutate,
    rejectItem: rejectItemMutation.mutate,
    isAssigning: assignToMeMutation.isPending,
    isApproving: approveItemMutation.isPending,
    isRejecting: rejectItemMutation.isPending
  }
}

/**
 * Hook for individual review item management
 * @param itemId - Review item ID
 * @returns Review item data and actions
 */
export const useReviewItem = (itemId: string) => {
  const queryClient = useQueryClient()

  const itemQuery = useQuery({
    queryKey: aiMatchingKeys.reviewItem(itemId),
    queryFn: async () => {
      // Implement single item fetch
      return null as ReviewQueueItem | null
    },
    enabled: !!itemId,
    staleTime: 30 * 1000,
  })

  const updateItemMutation = useMutation({
    mutationFn: async (updates: Partial<ReviewQueueItem>) => {
      // Implement item update
      //console.log('Updating review item:', itemId, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.reviewItem(itemId) })
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.reviewQueue() })
    }
  })

  return {
    data: itemQuery.data,
    isLoading: itemQuery.isLoading,
    error: itemQuery.error,
    updateItem: updateItemMutation.mutate,
    isUpdating: updateItemMutation.isPending
  }
}

/**
 * Hook for collecting training data from user corrections
 * @returns Training data collection mutation
 *
 * @example
 * ```tsx
 * const collectTrainingMutation = useTrainingDataCollection()
 *
 * const handleCorrection = (originalText: string, correctedText: string, entityId: string) => {
 *   collectTrainingMutation.mutate({
 *     originalText,
 *     correctedText,
 *     entityType: 'sku',
 *     entityId,
 *     confidence: 0.8
 *   })
 * }
 * ```
 */
export const useTrainingDataCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trainingData: {
      originalText: string
      correctedText: string
      entityType: 'sku' | 'shop' | 'brand'
      entityId: string
      confidence: number
      context?: string
      metadata?: any
    }) => {
      // Store training data for ML pipeline
      //console.log('Collecting training data:', trainingData)

      // This would integrate with actual training data storage
      return trainingData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.trainingData() })
      toast.success('Training data collected successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to collect training data: ${error.message}`)
    }
  })
}

/**
 * Hook to get matching statistics and performance metrics
 * @param entityType - Optional entity type filter
 * @returns Matching statistics
 *
 * @example
 * ```tsx
 * const { data: stats } = useMatchingStats('sku')
 * ```
 */
export const useMatchingStats = (entityType?: string) => {
  return useQuery({
    queryKey: aiMatchingKeys.matchingStats(entityType),
    queryFn: () => FuzzyMatchingClientService.getMatchingStats(entityType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Custom hook for end-to-end AI processing workflow
 * Combines OCR processing and fuzzy matching in a single operation
 *
 * @example
 * ```tsx
 * const { processDocument, progress, results } = useAIProcessingWorkflow()
 *
 * const handleDocumentProcess = (file: File) => {
 *   processDocument({
 *     file,
 *     ocrOptions: { preprocessImage: true },
 *     matchingOptions: { threshold: 0.7 }
 *   })
 * }
 * ```
 */
export const useAIProcessingWorkflow = () => {
  const [progress, setProgress] = useState<AIProcessingProgress>({
    stage: 'ocr',
    progress: 0,
    message: 'Ready'
  })
  const [results, setResults] = useState<{
    ocrResult?: OCRResult
    skuMatches?: FuzzyMatchResponse
    shopMatches?: FuzzyMatchResponse
    brandMatches?: FuzzyMatchResponse
  }>({})

  const queryClient = useQueryClient()

  const workflowMutation = useMutation({
    mutationFn: async ({
      file,
      ocrOptions,
      matchingOptions
    }: {
      file: File
      ocrOptions?: OCROptions
      matchingOptions?: MatchingOptions
    }) => {
      // Step 1: OCR Processing
      setProgress({ stage: 'ocr', progress: 10, message: 'Starting OCR processing...' })

      const ocrResult = await OCRClientService.processImage(file, ocrOptions)
      setResults(prev => ({ ...prev, ocrResult }))

      setProgress({ stage: 'ocr', progress: 50, message: 'OCR completed, extracting text...' })

      if (!ocrResult.extractedText) {
        throw new Error('No text extracted from image')
      }

      // Step 2: Fuzzy Matching
      setProgress({ stage: 'matching', progress: 60, message: 'Starting entity matching...' })

      const extractedLines = ocrResult.lines.map((line: any) => line.text).filter((text: string) => text.length > 2)

      const matchPromises = []

      // Match SKUs
      matchPromises.push(
        FuzzyMatchingClientService.batchMatch(extractedLines, 'sku', matchingOptions)
          .then(skuResults => ({ type: 'sku', results: skuResults }))
      )

      // Match shops
      matchPromises.push(
        FuzzyMatchingClientService.batchMatch(extractedLines, 'shop', matchingOptions)
          .then(shopResults => ({ type: 'shop', results: shopResults }))
      )

      // Match brands
      matchPromises.push(
        FuzzyMatchingClientService.batchMatch(extractedLines, 'brand', matchingOptions)
          .then(brandResults => ({ type: 'brand', results: brandResults }))
      )

      setProgress({ stage: 'matching', progress: 80, message: 'Processing matches...' })

      const matchResults = await Promise.all(matchPromises)

      const finalResults = {
        ocrResult,
        skuMatches: matchResults.find(r => r.type === 'sku')?.results[0],
        shopMatches: matchResults.find(r => r.type === 'shop')?.results[0],
        brandMatches: matchResults.find(r => r.type === 'brand')?.results[0]
      }

      setResults(finalResults)
      setProgress({ stage: 'completed', progress: 100, message: 'Processing completed successfully' })

      return finalResults
    },
    onSuccess: (results) => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.ocrResults() })
      queryClient.invalidateQueries({ queryKey: aiMatchingKeys.matchResults() })

      const totalMatches = [results.skuMatches, results.shopMatches, results.brandMatches]
        .filter(Boolean)
        .reduce((sum, match) => sum + (match?.results.length || 0), 0)

      toast.success(`Document processed successfully! Found ${totalMatches} total matches.`)
    },
    onError: (error: any) => {
      const message = error?.message || 'AI processing workflow failed'
      setProgress({
        stage: 'ocr',
        progress: 0,
        message: 'Failed',
        error: message
      })
      toast.error(message)
    }
  })

  return {
    processDocument: workflowMutation.mutate,
    isPending: workflowMutation.isPending,
    progress,
    results,
    error: workflowMutation.error,
    reset: () => {
      setProgress({ stage: 'ocr', progress: 0, message: 'Ready' })
      setResults({})
      workflowMutation.reset()
    }
  }
}

/**
 * Hook for confidence-based routing decisions
 * @param threshold - Confidence thresholds for routing
 * @returns Routing decision function
 *
 * @example
 * ```tsx
 * const { determineRoute } = useConfidenceRouting({
 *   highConfidence: 0.85,
 *   mediumConfidence: 0.50
 * })
 *
 * const route = determineRoute(matchResult)
 * ```
 */
export const useConfidenceRouting = (thresholds: {
  highConfidence?: number
  mediumConfidence?: number
} = {}) => {
  const { highConfidence = 0.85, mediumConfidence = 0.50 } = thresholds

  const determineRoute = useCallback((matchResult: MatchResult) => {
    if (matchResult.confidence >= highConfidence) {
      return {
        route: 'auto-process' as const,
        reason: 'High confidence match',
        confidence: matchResult.confidence
      }
    } else if (matchResult.confidence >= mediumConfidence) {
      return {
        route: 'review-queue' as const,
        reason: 'Medium confidence - requires review',
        confidence: matchResult.confidence
      }
    } else {
      return {
        route: 'manual-entry' as const,
        reason: 'Low confidence - manual entry required',
        confidence: matchResult.confidence
      }
    }
  }, [highConfidence, mediumConfidence])

  return {
    determineRoute,
    thresholds: { highConfidence, mediumConfidence }
  }
}

/**
 * Hook for real-time AI processing updates
 * Works with existing real-time subscriptions for upload sessions
 *
 * @example
 * ```tsx
 * const { isProcessing, currentStage } = useAIProcessingStatus(uploadSessionId)
 * ```
 */
export const useAIProcessingStatus = (uploadSessionId: string) => {
  const [processingStatus, setProcessingStatus] = useState<{
    isProcessing: boolean
    currentStage?: 'uploaded' | 'ocr' | 'matching' | 'reviewing' | 'completed'
    progress?: number
    message?: string
  }>({ isProcessing: false })

  // This would integrate with real-time subscriptions
  useEffect(() => {
    if (!uploadSessionId) return

    // Listen for upload session updates that include AI processing status
    const handleStatusUpdate = (status: any) => {
      if (status.ai_processing) {
        setProcessingStatus({
          isProcessing: status.ai_processing.in_progress,
          currentStage: status.ai_processing.stage,
          progress: status.ai_processing.progress,
          message: status.ai_processing.message
        })
      }
    }

    // This would be connected to real-time subscriptions
    //console.log('Setting up AI processing status listener for:', uploadSessionId)

    return () => {
      //console.log('Cleaning up AI processing status listener')
    }
  }, [uploadSessionId])

  return processingStatus
}
