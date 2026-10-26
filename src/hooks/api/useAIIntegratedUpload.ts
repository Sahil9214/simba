import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  AIIntegratedUploadClientService as AIIntegratedUploadService,
  AIIntegratedUploadClientService,
  type AIUploadSession,
  type AIUploadProgressEvent,
  type AIUploadProgressListener
} from '@/lib/services/aiIntegratedUpload.client';
import { AI_UPLOAD_KEYS } from '@/lib/query/keys';
import { showToast } from '@/components/ui/toast';
import { axiosInstance } from '@/lib/axios';
import { apiEndPoints } from '@/lib/axios/axios.endpoint';
import { keepPreviousData } from '@tanstack/react-query';



//utkarsh make the file

async function deleteUploadFile(fileId: string) {
  const response = await axiosInstance.delete(apiEndPoints.uploadCenter.deleteFile(fileId));
  return response.data
}

export const useUploadCenterDeleteFile = () => {

  return (
    useMutation({
      mutationKey: ["delete-upload-file"],
      mutationFn: (fileId: string) => deleteUploadFile(fileId),
    })
  )
}



/**
 * Hook for uploading government reports with AI processing
 * Provides real-time progress tracking through OCR and fuzzy matching stages
 *
 * @example
 * ```tsx
 * const { mutate: uploadWithAI, isPending, progress, currentStage } = useAIIntegratedUpload()
 *
 * const handleUpload = (file: File) => {
 *   uploadWithAI({
 *     file,
 *     uploadedBy: userId,
 *     options: { enableAIProcessing: true }
 *   }, {
 *     onSuccess: (session) => {
 *       console.log('Upload started:', session.id)
 *     }
 *   })
 * }
 * ```
 */



export const useAIIntegratedUpload = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<AIUploadProgressEvent['stage'] | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Progress listener
  const progressListener = useCallback<AIUploadProgressListener>((event) => {
    setProgress(event.progress);
    setCurrentStage(event.stage);
    setProgressMessage(event.message);

    // Show toast for major milestones
    if (event.stage === 'completed') {
      showToast('success', 'AI processing completed successfully!');
    } else if (event.stage === 'error') {
      showToast('error', `AI processing failed: ${event.message}`);
    }
  }, []);

  // Cleanup listener on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        AIIntegratedUploadService.removeProgressListener(sessionId, progressListener);
      }
    };
  }, [sessionId, progressListener]);

  const mutation = useMutation({
    mutationFn: async ({
      file,
      uploadedBy,
      options
    }: {
      file: File;
      uploadedBy: string;
      options?: Parameters<typeof AIIntegratedUploadService.uploadGovernmentReportWithAI>[2]
    }) => {
      // Reset progress state
      setProgress(0);
      setCurrentStage(null);
      setProgressMessage('');

      const result = await AIIntegratedUploadService.uploadGovernmentReportWithAI(file, uploadedBy, options);


      // Set up progress listening
      setSessionId(result.id);
      AIIntegratedUploadService.addProgressListener(result.id, progressListener);

      return result;
    },
    onSuccess: (data) => {
      // console.log("data upload success", data)
      queryClient.invalidateQueries({ queryKey: AI_UPLOAD_KEYS.sessions() });

    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to upload file';
      showToast('error', message);
      setProgress(0);
      setCurrentStage(null);
      setProgressMessage('');
    },
  });

  return {
    ...mutation,
    progress,
    currentStage,
    progressMessage,
    sessionId
  };
};

/**
 * Hook to get AI upload session with real-time updates
 *
 * @example
 * ```tsx
 * const { data: session, isLoading } = useAIUploadSession(sessionId)
 *
 * // Access AI-specific data
 * console.log(session?.ai_confidence_score)
 * console.log(session?.ai_routing_decision)
 * ```
 */
export const useAIUploadSession = (sessionId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: AI_UPLOAD_KEYS.session(sessionId),
    queryFn: () => AIIntegratedUploadService.getAIUploadSession(sessionId),
    enabled: enabled && !!sessionId,
    staleTime: 10 * 1000, // 10 seconds (AI sessions change frequently)
    refetchInterval: (query) => {
      // Stop refetching when processing is complete or failed
      if (query.state.data?.processing_status === 'completed' || query.state.data?.processing_status === 'failed') {
        return false;
      }
      return 5000; // 5 seconds for active processing
    },
  });
};

/**
 * Hook to get multiple AI upload sessions with filtering
 *
 * @example
 * ```tsx
 * const { data: sessions } = useAIUploadSessions({
 *   status: 'ai_processing',
 *   limit: 20
 * })
 * ```
 */
export const useAIUploadSessions = (
  options: Parameters<typeof AIIntegratedUploadClientService.getAIUploadSessions>[0] = {}
) => {
  return useQuery({
    queryKey: [...AI_UPLOAD_KEYS.sessions(), 'list', options],
    queryFn: () => AIIntegratedUploadClientService.getAIUploadSessions(options),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    placeholderData: keepPreviousData, // Keep previous data visible while fetching new data
  });
};

/**
 * Hook to retry failed AI processing
 *
 * @example
 * ```tsx
 * const retryMutation = useRetryAIProcessing()
 *
 * const handleRetry = (sessionId: string) => {
 *   retryMutation.mutate(sessionId)
 * }
 * ```
 */
export const useRetryAIProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => AIIntegratedUploadService.retryAIProcessing(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: AI_UPLOAD_KEYS.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: AI_UPLOAD_KEYS.sessions() });
      showToast('success', 'AI processing retry started');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to retry AI processing';
      showToast('error', message);
    },
  });
};

/**
 * Hook for real-time AI upload progress tracking
 * Subscribes to progress events for a specific session
 *
 * @example
 * ```tsx
 * const { progress, currentStage, message } = useAIUploadProgress(sessionId)
 *
 * return (
 *   <div>
 *     <p>Stage: {currentStage}</p>
 *     <p>Progress: {progress}%</p>
 *     <p>{message}</p>
 *   </div>
 * )
 * ```
 */
export const useAIUploadProgress = (sessionId: string | null) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<AIUploadProgressEvent['stage'] | null>(null);
  const [message, setMessage] = useState('');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setProgress(0);
      setCurrentStage(null);
      setMessage('');
      setLastUpdate(null);
      return;
    }

    const progressListener: AIUploadProgressListener = (event) => {
      setProgress(event.progress);
      setCurrentStage(event.stage);
      setMessage(event.message);
      setLastUpdate(event.timestamp);
    };

    AIIntegratedUploadService.addProgressListener(sessionId, progressListener);

    return () => {
      AIIntegratedUploadService.removeProgressListener(sessionId, progressListener);
    };
  }, [sessionId]);

  return {
    progress,
    currentStage,
    message,
    lastUpdate,
    isCompleted: currentStage === 'completed',
    hasError: currentStage === 'error'
  };
};

/**
 * Hook for AI upload statistics and summary
 * Provides aggregated data about AI processing performance
 *
 * @example
 * ```tsx
 * const { data: stats } = useAIUploadStats({
 *   timeRange: '24h',
 *   uploadedBy: userId
 * })
 * ```
 */
export const useAIUploadStats = (options: {
  timeRange?: '1h' | '24h' | '7d' | '30d';
  uploadedBy?: string;
} = {}) => {
  const { timeRange = '24h', uploadedBy } = options;

  return useQuery({
    queryKey: AI_UPLOAD_KEYS.analytics(timeRange, uploadedBy),
    queryFn: async () => {
      // Get sessions based on time range
      const now = new Date();
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };

      const startDate = new Date(now.getTime() - timeRangeMs[timeRange]);

      // This would need to be implemented in the service
      // For now, return basic stats from recent sessions
      const sessions = await AIIntegratedUploadService.getAIUploadSessions({
        limit: 1000
      });

      // Filter by uploadedBy on client side if needed
      const filteredSessions = uploadedBy
        ? sessions.filter(s => s.uploaded_by === uploadedBy)
        : sessions;

      const recentSessions = filteredSessions.filter(s =>
        new Date(s.created_at) >= startDate
      );

      const stats = {
        totalUploads: recentSessions.length,
        aiProcessed: recentSessions.filter(s => s.processing_status?.includes('ai')).length,
        autoApproved: recentSessions.filter(s => s.ai_routing_decision === 'auto_approved').length,
        inReview: recentSessions.filter(s => s.ai_routing_decision === 'review_queue').length,
        manualEntry: recentSessions.filter(s => s.ai_routing_decision === 'manual_entry').length,
        failed: recentSessions.filter(s => s.processing_status === 'failed').length,
        averageConfidence: recentSessions
          .filter(s => s.ai_confidence_score)
          .reduce((sum, s) => sum + (s.ai_confidence_score || 0), 0) /
          recentSessions.filter(s => s.ai_confidence_score).length || 0,
        averageProcessingTime: recentSessions
          .filter(s => s.ai_processing_time_ms)
          .reduce((sum, s) => sum + (s.ai_processing_time_ms || 0), 0) /
          recentSessions.filter(s => s.ai_processing_time_ms).length || 0,
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook for bulk operations on AI upload sessions
 *
 * @example
 * ```tsx
 * const { retryMultiple, cancelMultiple } = useBulkAIOperations()
 *
 * const handleBulkRetry = (sessionIds: string[]) => {
 *   retryMultiple.mutate(sessionIds)
 * }
 * ```
 */
export const useBulkAIOperations = () => {
  const queryClient = useQueryClient();

  const retryMultiple = useMutation({
    mutationFn: async (sessionIds: string[]) => {
      const results = await Promise.allSettled(
        sessionIds.map(id => AIIntegratedUploadService.retryAIProcessing(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { successful, failed, total: sessionIds.length };
    },
    onSuccess: ({ successful, failed, total }) => {
      queryClient.invalidateQueries({ queryKey: AI_UPLOAD_KEYS.sessions() });

      if (failed === 0) {
        showToast('success', `Successfully retried ${successful} AI processing jobs`);
      } else {
        showToast('warning', `Retried ${successful} jobs, ${failed} failed`);
      }
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to retry AI processing jobs';
      showToast('error', message);
    },
  });

  return {
    retryMultiple
  };
};

/**
 * Hook for AI upload session subscription
 * NOTE: Real-time subscriptions disabled after migration from Supabase to AWS RDS
 * Using polling instead via refetchInterval in useAIUploadSession
 */
export const useAIUploadSessionSubscription = (sessionId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    // Real-time subscriptions not available with AWS RDS
    // Polling is handled by useAIUploadSession query with refetchInterval
    console.log('Real-time subscriptions disabled - using polling instead');

    // Optional: Set up periodic invalidation
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: AI_UPLOAD_KEYS.session(sessionId)
      });
    }, 5000); // Refresh every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [sessionId, queryClient]);
};

/**
 * Custom hook for AI upload workflow management
 * Combines multiple upload operations for complex workflows
 */
export const useAIUploadWorkflow = () => {
  const [activeUploads, setActiveUploads] = useState<Map<string, AIUploadSession>>(new Map());
  const [completedUploads, setCompletedUploads] = useState<AIUploadSession[]>([]);
  const [failedUploads, setFailedUploads] = useState<AIUploadSession[]>([]);

  const addUpload = (session: AIUploadSession) => {
    setActiveUploads(prev => new Map(prev.set(session.id, session)));
  };

  const moveToCompleted = (sessionId: string) => {
    const session = activeUploads.get(sessionId);
    if (session) {
      setActiveUploads(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });
      setCompletedUploads(prev => [...prev, { ...session, processing_status: 'completed' }]);
    }
  };

  const moveToFailed = (sessionId: string) => {
    const session = activeUploads.get(sessionId);
    if (session) {
      setActiveUploads(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });
      setFailedUploads(prev => [...prev, { ...session, processing_status: 'failed' }]);
    }
  };

  const clearCompleted = () => setCompletedUploads([]);
  const clearFailed = () => setFailedUploads([]);

  const summary = {
    active: activeUploads.size,
    completed: completedUploads.length,
    failed: failedUploads.length,
    total: activeUploads.size + completedUploads.length + failedUploads.length
  };

  return {
    activeUploads: Array.from(activeUploads.values()),
    completedUploads,
    failedUploads,
    summary,
    addUpload,
    moveToCompleted,
    moveToFailed,
    clearCompleted,
    clearFailed
  };
};

/**
 * Hook for AI upload analytics and insights
 */
export const useAIUploadAnalytics = () => {
  const sessionsQuery = useQuery({
    queryKey: AI_UPLOAD_KEYS.sessions(),
    queryFn: () => AIIntegratedUploadService.getUploadSessions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const analytics = useMemo(() => {
    if (!sessionsQuery.data) return null;

    const sessions = sessionsQuery.data;
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter sessions by time period
    const recent24h = sessions.filter(s => new Date(s.created_at) > last24Hours);
    const recentWeek = sessions.filter(s => new Date(s.created_at) > lastWeek);

    // Calculate metrics
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.processing_status === 'completed').length;
    const failedSessions = sessions.filter(s => s.processing_status === 'failed').length;
    const processingSessions = sessions.filter(s => s.processing_status === 'ai_processing').length;

    const successRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const failureRate = totalSessions > 0 ? (failedSessions / totalSessions) * 100 : 0;

    // Processing time analysis
    const completedWithTime = sessions.filter(s =>
      s.processing_status === 'completed' && s.ai_processing_time
    );

    const avgProcessingTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, s) => sum + (s.ai_processing_time || 0), 0) / completedWithTime.length
      : 0;

    // File type analysis
    const fileTypeStats = sessions.reduce((acc, session) => {
      const fileExt = session.filename.split('.').pop()?.toLowerCase() || 'unknown';
      acc[fileExt] = (acc[fileExt] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Performance trends
    const dailyStats = recent24h.reduce((acc, session) => {
      const hour = new Date(session.created_at).getHours();
      if (!acc[hour]) {
        acc[hour] = { uploads: 0, completed: 0, failed: 0 };
      }
      acc[hour].uploads++;
      if (session.processing_status === 'completed') acc[hour].completed++;
      if (session.processing_status === 'failed') acc[hour].failed++;
      return acc;
    }, {} as Record<number, { uploads: number; completed: number; failed: number }>);

    // Error analysis
    const errorTypes = sessions
      .filter(s => s.processing_status === 'failed')
      .reduce((acc, session) => {
        const errorType = session.error_message?.split(':')[0] || 'Unknown Error';
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      overview: {
        totalSessions,
        completedSessions,
        failedSessions,
        processingSessions,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
        avgProcessingTime: Math.round(avgProcessingTime),
      },
      periods: {
        last24Hours: {
          count: recent24h.length,
          completed: recent24h.filter(s => s.processing_status === 'completed').length,
          failed: recent24h.filter(s => s.processing_status === 'failed').length,
        },
        lastWeek: {
          count: recentWeek.length,
          completed: recentWeek.filter(s => s.processing_status === 'completed').length,
          failed: recentWeek.filter(s => s.processing_status === 'failed').length,
        },
      },
      fileTypes: Object.entries(fileTypeStats)
        .map(([type, count]) => ({ type, count, percentage: (count / totalSessions) * 100 }))
        .sort((a, b) => b.count - a.count),
      hourlyDistribution: Object.entries(dailyStats)
        .map(([hour, stats]) => ({ hour: parseInt(hour), ...stats }))
        .sort((a, b) => a.hour - b.hour),
      topErrors: Object.entries(errorTypes)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      insights: {
        peakHour: Object.entries(dailyStats).reduce((max, [hour, stats]) =>
          stats.uploads > (dailyStats[parseInt(max)] || { uploads: 0 }).uploads ? hour : max, '0'
        ),
        mostCommonFileType: Object.entries(fileTypeStats).reduce((max, [type, count]) =>
          count > (fileTypeStats[max] || 0) ? type : max, 'unknown'
        ),
        needsAttention: failureRate > 10 || avgProcessingTime > 300, // 5 minutes
      },
    };
  }, [sessionsQuery.data]);

  return {
    data: analytics,
    isLoading: sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,
  };
};

/**
 * Hook for AI upload batch operations
 */
export const useAIUploadBatch = () => {
  const [batchSessions, setBatchSessions] = useState<AIUploadSession[]>([]);
  const [batchProgress, setBatchProgress] = useState<Record<string, number>>({});
  const [batchStatus, setBatchStatus] = useState<'idle' | 'uploading' | 'completed' | 'failed'>('idle');

  const uploadBatch = useCallback(async (files: File[], uploadedBy: string) => {
    setBatchStatus('uploading');
    setBatchSessions([]);
    setBatchProgress({});

    const sessions: AIUploadSession[] = [];
    const progressMap: Record<string, number> = {};

    try {
      // Start all uploads concurrently
      const uploadPromises = files.map(async (file) => {
        const session = await AIIntegratedUploadService.uploadGovernmentReportWithAI(file, uploadedBy);
        sessions.push(session);
        progressMap[session.id] = 0;

        // Set up progress tracking
        const progressListener = (event: AIUploadProgressEvent) => {
          setBatchProgress(prev => ({
            ...prev,
            [session.id]: event.progress,
          }));
        };

        AIIntegratedUploadService.addProgressListener(session.id, progressListener);

        return session;
      });

      await Promise.all(uploadPromises);

      setBatchSessions(sessions);
      setBatchStatus('completed');


    } catch (error) {
      setBatchStatus('failed');
      showToast('error', 'Batch upload failed');
      throw error;
    }
  }, []);

  const clearBatch = useCallback(() => {
    setBatchSessions([]);
    setBatchProgress({});
    setBatchStatus('idle');
  }, []);

  const overallProgress = useMemo(() => {
    const progressValues = Object.values(batchProgress);
    if (progressValues.length === 0) return 0;
    return progressValues.reduce((sum, progress) => sum + progress, 0) / progressValues.length;
  }, [batchProgress]);

  const completedCount = useMemo(() => {
    return Object.values(batchProgress).filter(progress => progress === 100).length;
  }, [batchProgress]);

  return {
    batchSessions,
    batchProgress,
    batchStatus,
    overallProgress,
    completedCount,
    totalCount: batchSessions.length,
    uploadBatch,
    clearBatch,
  };
};

/**
 * Hook for AI upload queue management
 */
export const useAIUploadQueue = () => {
  const queryClient = useQueryClient();

  const queueQuery = useQuery({
    queryKey: AI_UPLOAD_KEYS.queue(),
    queryFn: () => AIIntegratedUploadService.getProcessingQueue(),
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // 5 seconds
  });

  const prioritizeUpload = useMutation({
    mutationFn: (sessionId: string) => AIIntegratedUploadService.prioritizeUpload(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_UPLOAD_KEYS.all() });
      showToast('success', 'Upload prioritized');
    },
    onError: () => {
      showToast('error', 'Failed to prioritize upload');
    },
  });

  const cancelUpload = useMutation({
    mutationFn: (sessionId: string) => AIIntegratedUploadService.cancelUpload(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_UPLOAD_KEYS.all() });
      showToast('success', 'Upload cancelled');
    },
    onError: () => {
      showToast('error', 'Failed to cancel upload');
    },
  });

  const retryUpload = useMutation({
    mutationFn: (sessionId: string) => AIIntegratedUploadService.retryUpload(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_UPLOAD_KEYS.all() });
      showToast('success', 'Upload retry initiated');
    },
    onError: () => {
      showToast('error', 'Failed to retry upload');
    },
  });

  return {
    queue: queueQuery.data || [],
    isLoading: queueQuery.isLoading,
    isError: queueQuery.isError,
    error: queueQuery.error,
    refetch: queueQuery.refetch,
    prioritizeUpload: prioritizeUpload.mutate,
    cancelUpload: cancelUpload.mutate,
    retryUpload: retryUpload.mutate,
    isPrioritizing: prioritizeUpload.isPending,
    isCancelling: cancelUpload.isPending,
    isRetrying: retryUpload.isPending,
  };
};
