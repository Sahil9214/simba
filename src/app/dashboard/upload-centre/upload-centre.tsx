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
  useAIUploadSessions,
  useAIUploadProgress,
  useAIUploadAnalytics,
} from '@/hooks/api'
import { showToast } from '@/components/ui/toast'
import { FilenameValidationError } from '@/components/upload-center/FilenameValidationError';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DUMMY_UPLOAD_SESSIONS, DUMMY_UPLOAD_ANALYTICS } from '@/lib/constants/dummyData';
import { type AIUploadSession } from '@/lib/services/aiIntegratedUpload.client';

interface AIProcessingPipelineProps {
  sessionId: string | null;
  progress?: number;
  currentStage?: string | null;
  message?: string;
}

const AIProcessingPipeline = ({
  sessionId,
  progress: customProgress,
  currentStage: customStage,
  message: customMessage
}: AIProcessingPipelineProps) => {
  const hookData = useAIUploadProgress(sessionId);
  const progress = customProgress !== undefined ? customProgress : hookData.progress;
  const currentStage = customStage !== undefined ? customStage : hookData.currentStage;
  const message = customMessage !== undefined ? customMessage : hookData.message;
  const isCompleted = progress >= 100 || hookData.isCompleted;
  const hasError = hookData.hasError;

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

  if (!sessionId && customProgress === undefined) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-base font-semibold text-black flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Processing Pipeline
        </h2>
        <CardDescription>
          Real-time progress through OCR, matching, and routing stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4 overflow-x-auto py-1">
            <div className="flex items-center gap-4 min-w-[500px]">
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

  const displayAnalytics = analytics || DUMMY_UPLOAD_ANALYTICS;
  const { overview, periods } = displayAnalytics;

  return (
    <div className="font-inter grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
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
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-regular">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">{overview.successRate}%</div>
          <Progress value={overview.successRate} className="mt-2 h-1" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
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

interface EnhancedUploadTableProps {
  sessionsList: AIUploadSession[];
  onDeleteSession: (id: string) => void;
}

// Enhanced File Management with AI Insights
const EnhancedUploadTable = ({
  sessionsList,
  onDeleteSession
}: EnhancedUploadTableProps) => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<any>(null);

  const queryOptions = useMemo(() => ({
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  }), [dateRange.startDate, dateRange.endDate]);

  const { data: apiSessions, isFetching } = useAIUploadSessions(queryOptions);

  const effectiveSessions = useMemo(() => {
    let list = (apiSessions && apiSessions.length > 0) ? apiSessions : sessionsList;

    if (dateRange.startDate || dateRange.endDate) {
      list = list.filter(item => {
        const itemDate = new Date(item.created_at).getTime();
        if (dateRange.startDate && itemDate < new Date(dateRange.startDate).getTime()) return false;
        if (dateRange.endDate && itemDate > new Date(dateRange.endDate).getTime() + 86400000) return false;
        return true;
      });
    }

    return list;
  }, [apiSessions, sessionsList, dateRange]);

  const handleDateRangeChange = useCallback((startDate: string | null, endDate: string | null) => {
    setDateRange({ startDate, endDate });
  }, []);

  const onView = useCallback((fileRow: any) => {
    router.push(`/dashboard/upload-centre/review/${fileRow.id}`);
  }, [router]);

  const handleDownload = useCallback((session: any) => {
    showToast('info', 'Downloading document', session.filename || session.name || 'document');
    const link = document.createElement('a');
    link.href = session.file_url || '#';
    link.download = session.filename || session.name || 'document';
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
    onDeleteSession(fileToDelete.id);
    showToast("success", "File deleted successfully");
    setDeleteModalOpen(false);
    setFileToDelete(null);
  }, [fileToDelete, onDeleteSession]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  }, []);

  // Transform AI sessions to FileRow format for the table
  const transformedData: FileRow[] = effectiveSessions.map(session => {
    let status: 'Processed' | 'Processing' | 'cancelled';

    if (session.ai_processing_status === 'cancelled' || session.processing_status === 'cancelled') {
      status = 'cancelled';
    } else if (
      session.ai_processing_status === 'completed' ||
      session.processing_status === 'completed' ||
      (session.ai_extracted_text && session.ocr_confidence)
    ) {
      status = 'Processed';
    } else {
      status = 'Processing';
    }

    return {
      id: session.id,
      name: session.filename,
      type: (session.file_type as any) || 'PDF File',
      country: 'AI',
      role: `OCR: ${session.ocr_confidence ? Math.round(session.ocr_confidence * 100) + '%' : '98%'}`,
      date: new Date(session.created_at).toLocaleDateString(),
      status
    };
  });

  return (
    <>
      {isFetching && (
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
      <Dialog open={deleteModalOpen} onOpenChange={(open) => !open && handleCancelDelete()}>
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
              This action cannot be undone. The file will be permanently removed.
            </p>
          </DialogDescription>
          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={handleCancelDelete}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2 cursor-pointer"
            >
              Delete Permanently
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const handleFileUploadError = (session: any) => {
  showToast('error', session.message);
};

const UploadCentreComponent = () => {
  const [sessionsList, setSessionsList] = useState<AIUploadSession[]>(DUMMY_UPLOAD_SESSIONS);
  const [activeUploadSession, setActiveUploadSession] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filenameError, setFilenameError] = useState<any>(null);

  // Simulation state for upload progress
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simStage, setSimStage] = useState<string | null>(null);
  const [simMessage, setSimMessage] = useState('');

  const handleDeleteSession = useCallback((id: string) => {
    setSessionsList(prev => prev.filter(s => s.id !== id));
  }, []);

  // Handle file upload with realistic AI Pipeline stages and mock fallback
  const handleFileUpload = useCallback((files: File[]) => {
    if (files.length === 0) return;

    setSelectedFiles(files);
    setFilenameError(null);

    const firstFile = files[0];
    const newSessionId = `session-upload-${Date.now()}`;
    setActiveUploadSession(newSessionId);
    setIsSimulating(true);

    // Initial Stage: Upload
    setSimStage('upload');
    setSimProgress(15);
    setSimMessage(`Uploading ${files.length > 1 ? `${files.length} files` : firstFile.name}...`);

    // Stage 2: OCR Processing at 500ms
    setTimeout(() => {
      setSimStage('ocr');
      setSimProgress(45);
      setSimMessage('Extracting document table structures & text via OCR engine...');
    }, 600);

    // Stage 3: AI Matching at 1200ms
    setTimeout(() => {
      setSimStage('fuzzy_matching');
      setSimProgress(75);
      setSimMessage('Fuzzy matching beverage brands, SKUs and outlet records...');
    }, 1300);

    // Stage 4: Decision Routing at 1900ms
    setTimeout(() => {
      setSimStage('routing');
      setSimProgress(90);
      setSimMessage('Validating confidence scores & auto-approval rules...');
    }, 2000);

    // Stage 5: Completed at 2600ms
    setTimeout(() => {
      setSimStage('completed');
      setSimProgress(100);
      setSimMessage('AI processing completed! OCR Confidence: 98.6%');
      setIsSimulating(false);

      // Create new sessions for all uploaded files
      const newSessions: AIUploadSession[] = files.map((file, idx) => ({
        id: `${newSessionId}-${idx}`,
        filename: file.name,
        file_type: file.name.endsWith('.pdf')
          ? 'PDF File'
          : file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')
          ? 'Excel File'
          : 'Word Document',
        file_size: file.size,
        uploaded_by: 'Simba Admin',
        processing_status: 'completed',
        ai_processing_status: 'completed',
        ocr_confidence: 0.986,
        ai_confidence_score: 0.986,
        ai_routing_decision: 'auto_approved',
        ai_processing_time: 2600,
        file_url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
        ai_extracted_text: `Extracted table data for ${file.name}`
      }));

      setSessionsList(prev => [...newSessions, ...prev]);
      showToast('success', `${files.length > 1 ? `${files.length} files` : firstFile.name} uploaded & processed successfully!`);
    }, 2700);
  }, []);

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
      <AIProcessingPipeline
        sessionId={activeUploadSession}
        progress={activeUploadSession ? simProgress : undefined}
        currentStage={activeUploadSession ? simStage : undefined}
        message={activeUploadSession ? simMessage : undefined}
      />

      {/* Enhanced File Upload */}
      <Card className="bg-none border-none" style={{ padding: 0 }}>
        <CardContent className="p-0">
          <FileDropzone
            onFiles={handleFileUpload}
            maxFiles={10}
            accept=".xlsx,.xls,.pdf,.doc,.docx,.csv"
          />

          {/* Upload Progress */}
          {isSimulating && (
            <div className="mt-4 p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedFiles.length > 1 ? 'Batch Processing' : 'Processing'} {selectedFiles.length} File(s)...
                </span>
              </div>
              <div className="space-y-2">
                <Progress value={simProgress} className="h-2" />
                <p className="text-sm text-gray-600">
                  Stage: {simStage} - {simProgress}% • {simMessage}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="files" className="space-y-4 rounded-xl py-4">
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
          <EnhancedUploadTable
            sessionsList={sessionsList}
            onDeleteSession={handleDeleteSession}
          />
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
