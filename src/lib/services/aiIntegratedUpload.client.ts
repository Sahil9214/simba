/**
 * Client-safe AI Integrated Upload Service
 * This file only exports types and makes API calls (no database access)
 */

import { showToast } from "@/components/ui/toast";

export interface AIUploadSession {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  processing_status: 'uploaded' | 'ai_processing' | 'ai_completed' | 'ai_failed' | 'review_pending' | 'completed' | 'failed' | 'cancelled';
  ai_processing_status?: 'ocr_pending' | 'ocr_processing' | 'ocr_completed' | 'fuzzy_matching' | 'routing' | 'completed' | 'failed' | 'cancelled';
  ai_confidence_score?: number;
  ai_routing_decision?: 'auto_approved' | 'review_queue' | 'manual_entry';
  ai_processing_start_time?: string;
  ai_processing_end_time?: string;
  ai_processing_time_ms?: number;
  ai_processing_time?: number;
  ai_extracted_text?: string;
  ai_match_results?: any;
  ai_errors?: any;
  file_url: string;
  created_at: string;
  updated_at?: string;
  ai_skip_auto_approval?: boolean;
  ai_custom_thresholds?: any;
  processing_priority?: 'normal' | 'high' | 'urgent';
  error_message?: string;

  // Additional properties for API compatibility
  sessionId?: string; // Alias for id
  status?: 'uploaded' | 'ai_processing' | 'ai_completed' | 'ai_failed' | 'review_pending' | 'completed' | 'failed' | 'cancelled'; // Alias for processing_status
  progress?: number; // Calculated progress 0-100
  files?: Array<{ filename: string; size: number; type: string }>; // File metadata
  aiResults?: { // AI processing results summary
    confidence?: number;
    routing?: 'auto_approved' | 'review_queue' | 'manual_entry';
    ocrConfidence?: number;
    extractedText?: string;
    matchResults?: any;
  };
  confidence?: number; // Alias for ai_confidence_score
  routing?: 'auto_approved' | 'review_queue' | 'manual_entry'; // Alias for ai_routing_decision
  ocr_confidence?: number; // OCR-specific confidence score
  createdAt?: string; // Alias for created_at
  updatedAt?: string; // Alias for updated_at
}

export interface AIUploadProgressEvent {
  sessionId: string;
  stage: 'upload' | 'ocr' | 'fuzzy_matching' | 'routing' | 'completed' | 'error';
  progress: number; // 0-100
  message: string;
  data?: any;
  timestamp: string;
}

export type AIUploadProgressListener = (event: AIUploadProgressEvent) => void;

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

/**
 * Client-safe upload methods - all use API routes
 */
export class AIIntegratedUploadClientService {
  private static progressListeners = new Map<string, AIUploadProgressListener[]>();

  /**
   * Upload file through API route
   */
  static async uploadGovernmentReportWithAI(
    file: File,
    uploadedBy: string,
    options?: {
      enableAIProcessing?: boolean;
      skipAutoApproval?: boolean;
      customThresholds?: any;
      priority?: 'normal' | 'high' | 'urgent';
    }
  ): Promise<any> {
    try {
      const userId = localStorage.getItem('user_id');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', uploadedBy);
      formData.append('options', JSON.stringify(options || {}));
      formData.append('userId', userId?.toString() || '');
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/ai/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      console.log("data", data)
      return data;
    } catch (error) {
      console.log("error", error)
      throw new Error('Upload failed');
    }
  }

  /**
   * Get upload session by ID through API
   */
  static async getAIUploadSession(sessionId: string): Promise<AIUploadSession | null> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/${sessionId}`);
    if (!response.ok) return null;
    return response.json();
  }

  /**
   * Get all upload sessions through API
   */
  static async getAIUploadSessions(options: {
    status?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<AIUploadSession[]> {
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const url = `${API_BASE_URL}/api/ai/upload/queue?${params}`;
    // console.log('🔍 [AIIntegratedUploadClientService] Fetching sessions from:', url);

    const response = await fetch(url);


    if (!response.ok) {
      console.error('❌ [AIIntegratedUploadClientService] API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    // console.log('🔍 [AIIntegratedUploadClientService] Response data:', data);
    // console.log('🔍 [AIIntegratedUploadClientService] Sessions count:', data.sessions ? data.sessions.length : 0);
    console.log("*****", data)
    return data.sessions || [];
  }

  /**
   * Retry AI processing through API
   */
  static async retryAIProcessing(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/${sessionId}/retry`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Retry failed');
    }
  }

  /**
   * Get upload sessions (alias for compatibility)
   */
  static async getUploadSessions() {
    return this.getAIUploadSessions();
  }

  /**
   * Get processing queue through API
   */
  static async getProcessingQueue() {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/queue`);
    if (!response.ok) return [];
    return response.json();
  }

  /**
   * Prioritize upload through API
   */
  static async prioritizeUpload(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/${sessionId}/prioritize`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Prioritize failed');
    }
  }

  /**
   * Cancel upload through API
   */
  static async cancelUpload(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/${sessionId}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Cancel failed');
    }
  }

  /**
   * Retry upload through API
   */
  static async retryUpload(sessionId: string): Promise<void> {
    return this.retryAIProcessing(sessionId);
  }

  /**
   * Add progress listener (client-side only)
   */
  static addProgressListener(sessionId: string, listener: AIUploadProgressListener): void {
    if (!this.progressListeners.has(sessionId)) {
      this.progressListeners.set(sessionId, []);
    }
    this.progressListeners.get(sessionId)!.push(listener);
  }

  /**
   * Remove progress listener
   */
  static removeProgressListener(sessionId: string, listener: AIUploadProgressListener): void {
    const listeners = this.progressListeners.get(sessionId);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit progress event to all listeners
   */
  static emitProgress(event: AIUploadProgressEvent): void {
    const listeners = this.progressListeners.get(event.sessionId);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * Update upload session through API
   */
  static async updateUploadSession(
    sessionId: string,
    updates: Partial<AIUploadSession>
  ): Promise<AIUploadSession> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, updates })
    });

    if (!response.ok) {
      throw new Error('Failed to update upload session');
    }
    return response.json();
  }

  /**
   * Cancel upload session through API
   */
  static async cancelUploadSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload?sessionId=${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to cancel upload session');
    }
  }

  /**
   * Process multiple queue items through API
   */
  static async processQueueItems(sessionIds: string[]): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'process', sessionIds })
    });

    if (!response.ok) {
      throw new Error('Failed to process queue items');
    }

    const data = await response.json();
    return data.results || [];
  }

  /**
   * Retry multiple queue items through API
   */
  static async retryQueueItems(sessionIds: string[]): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'retry', sessionIds })
    });

    if (!response.ok) {
      throw new Error('Failed to retry queue items');
    }

    const data = await response.json();
    return data.results || [];
  }

  /**
   * Cancel multiple queue items through API
   */
  static async cancelQueueItems(sessionIds: string[]): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', sessionIds })
    });

    if (!response.ok) {
      throw new Error('Failed to cancel queue items');
    }

    const data = await response.json();
    return data.results || [];
  }

  /**
   * Approve multiple queue items through API
   */
  static async approveQueueItems(sessionIds: string[]): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', sessionIds })
    });

    if (!response.ok) {
      throw new Error('Failed to approve queue items');
    }

    const data = await response.json();
    return data.results || [];
  }

  /**
   * Reject multiple queue items through API
   */
  static async rejectQueueItems(sessionIds: string[]): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', sessionIds })
    });

    if (!response.ok) {
      throw new Error('Failed to reject queue items');
    }

    const data = await response.json();
    return data.results || [];
  }

  /**
   * Update queue settings through API
   */
  static async updateQueueSettings(settings: {
    autoApproveThreshold?: number;
    reviewQueueThreshold?: number;
    enableOCR?: boolean;
    enableFuzzyMatching?: boolean;
    enableAutoRouting?: boolean;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/ai/upload/queue`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    });

    if (!response.ok) {
      throw new Error('Failed to update queue settings');
    }

    const data = await response.json();
    return data.settings;
  }
}
