"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
  Brain,
  Target,
  TrendingUp,
  Loader2,
  Bot,
  X,

} from 'lucide-react'
import { FileDropzone } from './fileDropzone'
import { UploadCentreTable } from '@/components/tables'
import { FileRow } from '@/lib/types/legacy'
import {
  useAIIntegratedUpload,
  useAIUploadSessions,
  useAIUploadProgress,
  useAIUploadAnalytics,
  useAIUploadBatch,
  useAIUploadQueue,
  useRetryAIProcessing,
  useBulkAIOperations
} from '@/hooks/api'
import { showToast } from '@/components/ui/toast'
import { FilenameValidationError } from '@/components/upload-center/FilenameValidationError';
import { useUploadCenterDeleteFile } from '@/hooks/api/useAIIntegratedUpload';
import { useQueryClient } from '@tanstack/react-query';
import { AI_UPLOAD_KEYS } from '@/lib/query/keys';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { keepPreviousData } from '@tanstack/react-query';

const AIProcessingPipeline = ({ sessionId }: { sessionId: string | null }) => {
  const { progress, currentStage, message, isCompleted, hasError } = useAIUploadProgress(sessionId);

  const stages = [
    { key: 'upload', label: 'Upload', icon: Upload },
    { key: 'ocr', label: 'OCR Processing', icon: FileText },
    { key: 'fuzzy_matching', label: 'AI Matching', icon: Brain },
    { key: 'routing', label: 'Decision Routing', icon: Target },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 }
  ];

  const getStageStatus = (stageKey: string) => {
    if (!currentStage) return 'pending';

    const currentIndex = stages.findIndex(s => s.key === currentStage);
    const stageIndex = stages.findIndex(s => s.key === stageKey);

    if (hasError) return stageIndex <= currentIndex ? 'error' : 'pending';
    if (isCompleted) return 'completed';
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'processing';
    return 'pending';
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  if (!sessionId) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-base font-semibold text-black">
          <Bot className="w-5 h-5" />
          AI Processing Pipeline
        </h2>
        <CardDescription>
          Real-time progress through OCR, matching, and routing stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {stages.map((stage, index) => {
                const status = getStageStatus(stage.key);
                const Icon = stage.icon;

                return (
                  <div key={stage.key} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${status === 'processing' ? 'border-blue-500 bg-blue-50' : ''}
                      ${status === 'completed' ? 'border-green-500 bg-green-50' : ''}
                      ${status === 'error' ? 'border-red-500 bg-red-50' : ''}
                      ${status === 'pending' ? 'border-gray-200 bg-gray-50' : ''}
                    `}>
                      <Icon className={`w-5 h-5 ${status === 'processing' ? 'text-blue-600' :
                        status === 'completed' ? 'text-green-600' :
                          status === 'error' ? 'text-red-600' : 'text-gray-400'
                        }`} />
                    </div>

                    {index < stages.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 ${getStageStatus(stages[index + 1].key) !== 'pending' ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {message && (
              <p className="text-sm text-gray-600">{message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// AI Upload Analytics Dashboard
const AIUploadAnalyticsDashboard = () => {
  const { data: analytics, isLoading } = useAIUploadAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const { overview, periods, insights } = analytics;

  return (
    <div className="font-inter grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center  space-y-0 pb-2">
          <CardTitle className="text-sm font-regular">Total Uploads</CardTitle>
          <Upload className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">{overview.totalSessions}</div>
          <p className="text-xs text-muted-foreground">
            +{periods.last24Hours.count} from last 24h
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center  space-y-0 pb-2">
          <CardTitle className="text-sm font-regular">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">{overview.successRate}%</div>
          <Progress value={overview.successRate} className="mt-2 h-1" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center  space-y-0 pb-2">
          <CardTitle className="text-sm font-regular">Avg Processing Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">{Math.round(overview.avgProcessingTime / 1000)}s</div>
          <p className="text-xs text-muted-foreground">
            Per file processing
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-regular">Auto Approved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">{overview.completedSessions}</div>
          <p className="text-xs text-muted-foreground">
            AI confidence: High
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced AI Upload Queue Management
// const AIUploadQueueManager = () => {
//   const {
//     queue,
//     isLoading,
//     prioritizeUpload,
//     cancelUpload,
//     retryUpload,
//     isPrioritizing,
//     isCancelling,
//     isRetrying
//   } = useAIUploadQueue();

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Processing Queue</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center h-32">
//             <Loader2 className="w-6 h-6 animate-spin" />
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const activeQueue = queue.filter((item: any) =>
//     item.processing_status === 'ai_processing' ||
//     item.processing_status === 'uploaded'
//   );

//   if (activeQueue.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Activity className="w-5 h-5" />
//             Processing Queue
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8 text-gray-500">
//             <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
//             <p>No files currently in processing queue</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Activity className="w-5 h-5" />
//           Processing Queue ({activeQueue.length})
//         </CardTitle>
//         <CardDescription>
//           Files currently being processed by AI systems
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           {activeQueue.slice(0, 5).map((item: any) => (
//             <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
//               <div className="flex items-center gap-3">
//                 <div className="relative">
//                   <FileText className="w-8 h-8 text-blue-500" />
//                   {item.processing_status === 'ai_processing' && (
//                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
//                   )}
//                 </div>
//                 <div>
//                   <p className="font-medium text-sm">{item.filename}</p>
//                   <div className="flex items-center gap-2 text-xs text-gray-500">
//                     <Badge variant="outline" className="text-xs">
//                       {item.ai_processing_status || item.processing_status}
//                     </Badge>
//                     {item.ocr_confidence && (
//                       <span>OCR: {Math.round(item.ocr_confidence * 100)}%</span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => prioritizeUpload(item.id)}
//                   disabled={isPrioritizing}
//                 >
//                   <ArrowRight className="w-3 h-3" />
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => retryUpload(item.id)}
//                   disabled={isRetrying}
//                 >
//                   <RefreshCw className="w-3 h-3" />
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => cancelUpload(item.id)}
//                   disabled={isCancelling}
//                 >
//                   <XCircle className="w-3 h-3" />
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// Enhanced File Management with AI Insights
const EnhancedUploadTable = () => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<any>(null);

  // Memoize query options to prevent unnecessary query key changes
  // This ensures React Query doesn't treat every date change as a completely new query
  const queryOptions = useMemo(() => ({
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  }), [dateRange.startDate, dateRange.endDate]);

  // Use isFetching to distinguish between initial load and refetch
  const { data: sessions, isLoading, isFetching, error } = useAIUploadSessions(queryOptions);
  const { mutate: deleteFile, isPending: isDeleting } = useUploadCenterDeleteFile();
  const queryClient = useQueryClient();

  const handleDateRangeChange = useCallback((startDate: string | null, endDate: string | null) => {
    setDateRange({ startDate, endDate });
  }, []);

  const onView = useCallback((fileRow: any) => {
    const originalSession = sessions?.find(s => s.id === fileRow.id);

    if (originalSession?.ai_processing_status === 'completed') {
      router.push(`/dashboard/upload-centre/review/${fileRow.id}`);
    } else {
      showToast('info', 'OCR processing not completed yet', 'Please wait for OCR to finish');
    }
  }, [router, sessions]);

  const handleDownload = useCallback((session: any) => {
    const link = document.createElement('a');
    link.href = session.file_url;
    link.download = session.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const onDelete = useCallback(
    (file: any) => {
      setFileToDelete(file);
      setDeleteModalOpen(true);
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    if (!fileToDelete) return;

    deleteFile(fileToDelete.id, {
      onSuccess: () => {
        showToast("success", "File deleted successfully");
        setDeleteModalOpen(false);
        setFileToDelete(null);
        queryClient.invalidateQueries({
          queryKey: AI_UPLOAD_KEYS.sessions(),
        });
      },
      onError: (err: any) => {
        showToast("error", err?.message || "Failed to delete file");
        setDeleteModalOpen(false);
        setFileToDelete(null);
      },
    });
  }, [deleteFile, fileToDelete, queryClient]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  }, []);

  // Only show full loading spinner on initial load when no data exists
  // This prevents the table from disappearing when changing date ranges
  if (isLoading && !sessions) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform AI sessions to FileRow format for the table
  const transformedData: FileRow[] = sessions?.map(session => {
    let status: 'Processed' | 'Processing' | 'cancelled';

    if (session.ai_processing_status === 'cancelled') {
      status = 'cancelled';
    } else if (session.ai_processing_status === 'completed' ||
      (session.ai_extracted_text && session.ocr_confidence)) {
      status = 'Processed';
    } else {
      status = 'Processing';
    }

    return {
      id: session.id,
      name: session.filename,
      type: session.file_type as any,
      country: 'AI',
      role: `OCR: ${session.ocr_confidence ? Math.round(session.ocr_confidence * 100) + '%' : 'N/A'}`,
      date: new Date(session.created_at).toLocaleDateString(),
      status
    };
  }) || [];

  return (
    <>
      {/* Subtle loading indicator when fetching new data but previous data exists */}
      {isFetching && sessions && sessions.length > 0 && (
        <div className="mb-2 flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-blue-700">Updating data...</span>
          </div>
        </div>
      )}

      <UploadCentreTable
        data={transformedData}
        onView={onView}
        onDownload={handleDownload}
        onDelete={onDelete}
        onDateRangeChange={handleDateRangeChange}
        col1="File Name"
        col2="File Type"
        col3="AI Confidence"
        col4="Upload Date"
        col5="Status"
        col6="Actions"
        heading="AI-Processed Files"
        extraInfomation="Files processed through AI matching pipeline with confidence scores and routing decisions"
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={(open) => !open && !isDeleting && handleCancelDelete()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold">
                Delete File?
              </DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-600 pt-2">
            <p className="mb-2">
              Are you sure you want to delete <strong className="text-gray-900">{fileToDelete?.name}</strong>?
            </p>
            <p className="text-red-600 font-medium">
              This action cannot be undone. The file will be permanently deleted.
            </p>
          </DialogDescription>
          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const handleFileUploadError = (session: any) => {
  showToast('error', session.message);
}


const UploadCentreComponent = () => {
  const [activeUploadSession, setActiveUploadSession] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filenameError, setFilenameError] = useState<any>(null); // Add this state

  const {
    mutate: uploadWithAI,
    isPending: isUploading,
    progress,
    currentStage,
    sessionId
  } = useAIIntegratedUpload();

  const {
    uploadBatch,
    batchStatus,
    overallProgress,
    completedCount,
    totalCount,
    clearBatch
  } = useAIUploadBatch();

  // Handle single file upload
  const handleFileUpload = useCallback((files: File[]) => {
    if (files.length === 0) return;

    setSelectedFiles(files);
    setFilenameError(null); // Clear previous errors

    if (files.length === 1) {
      // Single file upload
      uploadWithAI({
        file: files[0],
        uploadedBy: 'current-user-id',
        options: {
          enableAIProcessing: true,
          priority: 'normal'
        }
      }, {
        onSuccess: (session) => {
          setActiveUploadSession(session.id);
          if (!session.success && session.error === 'INVALID_FILENAME') {
            showToast('error', session.message);
            setFilenameError(session);
            handleFileUploadError(session);
          }
          else {
            showToast('success', 'File uploaded successfully');
          }
        },
        onError: (error) => {

          // Check if it's a filename validation error
          if (error?.error === 'INVALID_FILENAME') {
            setFilenameError(error);
            showToast('error', error.message);
          }
          else {
            showToast('error', 'File upload failed', error.message);
          }
        }
      });
    } else {
      // Batch upload
      uploadBatch(files, 'current-user-id').then(() => {
        showToast('success', 'files upload successfully');
      }).catch((error) => {
        showToast('error', 'Batch upload failed', error.message);
        if (error?.error === 'INVALID_FILENAME') {
          setFilenameError(error);
        }
      });
    }
  }, [uploadWithAI, uploadBatch]);

  return (
    <div className="space-y-6">
      {/* Filename Validation Error Modal */}
      {filenameError && (
        <FilenameValidationError
          error={filenameError}
          open={!!filenameError}
          onDismiss={() => setFilenameError(null)}
        />
      )}

      {/* AI Processing Pipeline */}
      <AIProcessingPipeline sessionId={activeUploadSession || sessionId} />

      {/* Enhanced File Upload */}
      <Card className="bg-none border-none"
        style={{ padding: 0 }}
      >

        <CardContent className='p-0'>
          <FileDropzone
            onFiles={handleFileUpload}
            maxFiles={10}
            accept=".xlsx,.xls,.pdf,.doc,.docx,.csv"
          />

          {/* Upload Progress */}
          {(isUploading || batchStatus === 'uploading') && (
            <div className="mt-4 p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">
                  {selectedFiles.length > 1 ? 'Batch Processing' : 'Processing'} Files...
                </span>
              </div>
              {selectedFiles.length > 1 ? (
                <div className="space-y-2">
                  <Progress value={overallProgress} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {completedCount}/{totalCount} files completed
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600">
                    Stage: {currentStage} - {progress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="files" className="space-y-4  rounded-xl py-4">
        <TabsList className="grid w-full bg-transparent grid-cols-4">
          <TabsTrigger value="files" className="flex items-center gap-2 cursor-pointer">
            <FileText className="w-4 h-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 cursor-pointer">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <EnhancedUploadTable />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 bg-white py-4 rounded-2xl">
          <AIUploadAnalyticsDashboard />

          <div className="grid gap-4 md:grid-cols-2 px-2">
            <Card className="border-container-card py-3 ">
              <CardHeader>
                <CardTitle className="font-inter text-base text-black font-regular">Processing Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-container-card shadow-sm">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      AI confidence scores have improved by 15% this week with enhanced training data.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-container-card shadow-sm">
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Processing speed increased by 23% with optimized OCR pipeline.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card className="border-container-card py-3">
              <CardHeader>
                <CardTitle className="font-inter text-base text-black font-regular">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-container-card bg-white rounded-lg shadow-sm p-4">
                    <span className="text-sm font-medium">OCR Accuracy</span>
                    <Badge variant="outline" className="border-container-card">98.5%</Badge>
                  </div>
                  <div className="flex justify-between items-center border-container-card bg-white rounded-lg shadow-sm p-4">
                    <span className="text-sm font-medium">Matching Precision</span>
                    <Badge variant="outline" className="border-container-card">94.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center border-container-card bg-white rounded-lg shadow-sm p-4">
                    <span className="text-sm font-medium">Auto-Approval Rate</span>
                    <Badge variant="outline" className="border-container-card">87.3%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UploadCentreComponent
