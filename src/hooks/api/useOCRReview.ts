import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/components/ui/toast';
import { axiosInstance } from '@/lib/axios';
import { apiEndPoints } from '@/lib/axios/axios.endpoint';

// Type definition (previously from backend service)
export interface TableCellData {
  rowIndex: number;
  colIndex: number;
  value: string | number;
}

export interface TableRowData {
  id: string;
  rowIndex: number;
  cells: Record<string, TableCellData>;
}

// Flexible type to support multiple data formats
export interface StructuredTableData {
  headers: string[];
  rows: any;
  metadata?: Record<string, any>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

export interface ReviewSessionData {
  sessionId: string;
  filename: string;
  fileType: string;
  uploadedAt: string;
  ocrConfidence?: number;
  processingStatus: string;
  tableData: StructuredTableData;
  rawText: string;
}

export interface SaveReviewPayload {
  sessionId: string;
  tableData: StructuredTableData;
  userId?: string;
}

/**
 * Hook for fetching OCR review data
 *
 * @example
 * ```tsx
 * const { data: reviewData, isLoading } = useOCRReviewData(sessionId)
 * ```
 */
async function ocrReviewDataApi(sessionId: string) {
  const response = await axiosInstance(apiEndPoints.uploadCenter.ocrReviewData(sessionId));
  return response.data
}

export const useOCRReviewData = (sessionId: string) => {

  return useQuery({
    queryKey: ['ocr-review', sessionId],
    queryFn: () => ocrReviewDataApi(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for saving reviewed OCR data
 *
 * @example
 * ```tsx
 * const { mutate: saveReview, isPending } = useSaveOCRReview()
 *
 * const handleSave = () => {
 *   saveReview({
 *     sessionId,
 *     tableData: editedTableData,
 *     userId
 *   }, {
 *     onSuccess: () => {
 *       router.push('/dashboard/upload-centre')
 *     }
 *   })
 * }
 * ```
 */
export const useSaveOCRReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveReviewPayload) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_BASE_URL}/api/upload-sessions/${payload.sessionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          tableData: payload.tableData,
          userId: payload.userId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save review data');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      showToast('success', 'Changes saved successfully', `${data.editedCellsCount} cells updated`);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['ocr-review', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['ai-upload-sessions'] });
    },
    onError: (error: Error) => {
      showToast('error', 'Failed to save changes', error.message);
    }
  });
};

/**
 * Hook for discarding review and returning to upload centre
 *
 * @example
 * ```tsx
 * const { mutate: discardReview } = useDiscardOCRReview()
 * ```
 */
export const useDiscardOCRReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      // Optionally mark session as "review_discarded"
      // For now, just return success
      return { success: true };
    },
    onSuccess: () => {
      showToast('info', 'Review discarded', 'Returning to upload centre');
      queryClient.invalidateQueries({ queryKey: ['ai-upload-sessions'] });
    }
  });
};
