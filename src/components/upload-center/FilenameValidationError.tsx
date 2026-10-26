"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  FileText,
  CheckCircle2,
  Info,
  Lightbulb,
  Copy,
  FileWarning
} from 'lucide-react';
import { showToast } from '@/components/ui/toast';

interface InvalidFile {
  name: string;
  reason: string;
}

interface Example {
  pattern: string;
  example: string;
}

interface FilenameValidationErrorProps {
  error: {
    success: false;
    error: string;
    message: string;
    why?: string;
    invalidFiles?: InvalidFile[];
    allowedFormats?: string[];
    examples?: Example[];
    tips?: string[];
  };
  open: boolean;
  onDismiss?: () => void;
}

export function FilenameValidationError({ error, open, onDismiss }: FilenameValidationErrorProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyExample = (example: string, index: number) => {
    navigator.clipboard.writeText(example);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    showToast('success', 'Filename copied', 'You can paste it now');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss?.()}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] scrollbar-hide overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-3">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="mt-0.5 sm:mt-1">
              <FileWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-sm sm:text-base font-semibold text-red-900 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Invalid Filename Format</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-red-800 mt-1.5 sm:mt-2 font-medium">
                {error.message}
              </DialogDescription>
              {error.why && (
                <p className="text-[10px] sm:text-xs text-red-700 mt-1 sm:mt-1.5">
                  {error.why}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 sm:space-y-3 max-h-[calc(90vh-120px)] scrollbar-custom overflow-y-auto pr-1">
          {/* Invalid Files Section */}
          {error.invalidFiles && error.invalidFiles.length > 0 && (
            <Alert variant="destructive" className="bg-red-100 border-red-300 p-2 sm:p-3">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <AlertDescription className="text-red-900 text-xs sm:text-sm">
                <div className="font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm">Invalid Files:</div>
                <div className="space-y-1.5 sm:space-y-2">
                  {error.invalidFiles.map((file, index) => (
                    <div key={index} className="flex items-start gap-1.5 sm:gap-2 bg-red-50 p-1.5 sm:p-2 rounded">
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[10px] sm:text-xs font-medium text-red-900 break-all">
                          {file.name}
                        </div>
                        <div className="text-[10px] sm:text-xs text-red-700 mt-0.5">
                          {file.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Allowed Formats Section */}
          {error.allowedFormats && error.allowedFormats.length > 0 && (
            <div className="bg-white rounded-lg border border-red-200 p-2.5 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900">Allowed Filename Formats</h4>
              </div>
              <div className="space-y-2 sm:space-y-2.5">
                {error.allowedFormats.map((format, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-2">
                    <Badge variant="outline" className="font-mono text-[9px] sm:text-[10px] bg-green-50 text-green-700 border-green-300 whitespace-nowrap">
                      Format {index + 1}
                    </Badge>
                    <code className="text-[10px] sm:text-xs text-gray-800 font-mono bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-1 break-all">
                      {format}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples Section */}
          {error.examples && error.examples.length > 0 && (
            <div className="bg-white rounded-lg border border-blue-200 p-2.5 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900">Example Filenames</h4>
              </div>
              <div className="space-y-2 sm:space-y-2.5">
                {error.examples.map((example, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] bg-blue-100 text-blue-700 border-blue-300">
                        Pattern: {example.pattern}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyExample(example.example, index)}
                        className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <code className="text-[10px] sm:text-xs text-blue-900 font-mono block break-all bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200">
                      {example.example}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Section */}
          {error.tips && error.tips.length > 0 && (
            <div className="bg-white rounded-lg border border-yellow-200 p-2.5 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900">Tips for Correct Format</h4>
              </div>
              <ul className="space-y-1.5 sm:space-y-2">
                {error.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-700">
                    <span className="text-yellow-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
