'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit3, 
  Save, 
  SkipForward,
  RotateCcw,
  Zap,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useReviewQueue, useReviewItem, useTrainingDataCollection } from '@/hooks/api/useAIMatching'
import type { ReviewQueueItem } from '@/hooks/api/useAIMatching'
import type { MatchResult } from '@/lib/types/fuzzyMatching.types'

interface AIReviewInterfaceProps {
  className?: string
  initialFilters?: {
    status?: 'pending' | 'in_review' | 'approved' | 'rejected'
    priority?: 'high' | 'medium' | 'low'
  }
  onItemProcessed?: (itemId: string, action: 'approved' | 'rejected') => void
}

interface EditableMatch {
  originalText: string
  correctedText: string
  entityId: string
  entityType: 'sku' | 'shop' | 'brand'
  confidence: number
  isEditing: boolean
}

export function AIReviewInterface({ 
  className, 
  initialFilters = {}, 
  onItemProcessed 
}: AIReviewInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [filters, setFilters] = useState(initialFilters)
  const [editableMatches, setEditableMatches] = useState<Record<string, EditableMatch>>({})
  const [showConfidenceThreshold, setShowConfidenceThreshold] = useState(0.5)
  
  // Keyboard shortcut refs
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})

  // API hooks
  const { data: reviewItems, isLoading, assignToMe, approveItem, rejectItem } = useReviewQueue(filters)
  const currentItem = reviewItems[currentIndex]
  const { data: itemDetails } = useReviewItem(selectedItemId || '')
  const collectTrainingMutation = useTrainingDataCollection()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleApprove()
          }
          break
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleReject()
          }
          break
        case 'n':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleNext()
          }
          break
        case 'p':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handlePrevious()
          }
          break
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleSaveCorrections()
          }
          break
        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            enableEditMode()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentItem])

  // Navigation functions
  const handleNext = useCallback(() => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setEditableMatches({})
    }
  }, [currentIndex, reviewItems.length])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setEditableMatches({})
    }
  }, [currentIndex])

  // Review actions
  const handleApprove = useCallback(async () => {
    if (!currentItem) return

    try {
      // Apply corrections if any
      const corrections = Object.values(editableMatches).filter(match => 
        match.correctedText !== match.originalText
      )

      if (corrections.length > 0) {
        // Collect training data
        for (const correction of corrections) {
          await collectTrainingMutation.mutateAsync({
            originalText: correction.originalText,
            correctedText: correction.correctedText,
            entityType: correction.entityType,
            entityId: correction.entityId,
            confidence: correction.confidence,
            context: currentItem.extractedText
          })
        }
      }

      await approveItem({ 
        itemId: currentItem.id, 
        corrections: corrections.length > 0 ? corrections : undefined 
      })

      onItemProcessed?.(currentItem.id, 'approved')
      handleNext()
      
      toast.success(
        corrections.length > 0 
          ? `Item approved with ${corrections.length} corrections` 
          : 'Item approved'
      )
    } catch (error) {
      console.error('Failed to approve item:', error)
      toast.error('Failed to approve item')
    }
  }, [currentItem, editableMatches, approveItem, collectTrainingMutation, onItemProcessed, handleNext])

  const handleReject = useCallback(async () => {
    if (!currentItem) return

    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      await rejectItem({ itemId: currentItem.id, reason })
      onItemProcessed?.(currentItem.id, 'rejected')
      handleNext()
      toast.success('Item rejected')
    } catch (error) {
      console.error('Failed to reject item:', error)
      toast.error('Failed to reject item')
    }
  }, [currentItem, rejectItem, onItemProcessed, handleNext])

  const handleSaveCorrections = useCallback(() => {
    const corrections = Object.values(editableMatches).filter(match => 
      match.correctedText !== match.originalText
    )
    
    if (corrections.length > 0) {
      toast.success(`${corrections.length} corrections saved`)
    } else {
      toast.info('No corrections to save')
    }
  }, [editableMatches])

  const enableEditMode = useCallback(() => {
    if (!currentItem) return

    const newEditableMatches: Record<string, EditableMatch> = {}
    
    currentItem.suggestedMatches.forEach((match, index) => {
      const key = `${match.entityType}-${index}`
      newEditableMatches[key] = {
        originalText: match.entity,
        correctedText: match.entity,
        entityId: match.entity, // This would be the actual entity ID
        entityType: match.entityType,
        confidence: match.confidence,
        isEditing: true
      }
    })

    setEditableMatches(newEditableMatches)
    toast.info('Edit mode enabled - make your corrections')
  }, [currentItem])

  // Handle text correction
  const handleTextCorrection = (key: string, correctedText: string) => {
    setEditableMatches(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        correctedText
      }
    }))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'bg-green-100 text-green-800 border-green-300'
    if (confidence >= 0.50) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.85) return <CheckCircle className="h-4 w-4" />
    if (confidence >= 0.50) return <AlertTriangle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading review queue...</p>
        </div>
      </div>
    )
  }

  if (!reviewItems.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">No items in the review queue.</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("space-y-6", className)}>
      {/* Header with navigation and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">AI Review Queue</h2>
          <Badge variant="secondary">
            {currentIndex + 1} of {reviewItems.length}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filter controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Implement filter modal */}}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          {/* Navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === reviewItems.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-sm text-blue-800">
            <span><kbd className="bg-blue-200 px-1 rounded">Ctrl+A</kbd> Approve</span>
            <span><kbd className="bg-blue-200 px-1 rounded">Ctrl+R</kbd> Reject</span>
            <span><kbd className="bg-blue-200 px-1 rounded">Ctrl+N</kbd> Next</span>
            <span><kbd className="bg-blue-200 px-1 rounded">Ctrl+P</kbd> Previous</span>
            <span><kbd className="bg-blue-200 px-1 rounded">Ctrl+E</kbd> Edit</span>
            <span><kbd className="bg-blue-200 px-1 rounded">Ctrl+S</kbd> Save</span>
          </div>
        </CardContent>
      </Card>

      {currentItem && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Original Image and OCR Text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Original Document</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={currentItem.priority === 'high' ? 'destructive' : 
                                 currentItem.priority === 'medium' ? 'default' : 'secondary'}>
                    {currentItem.priority} priority
                  </Badge>
                  <Badge variant="outline">
                    {new Date(currentItem.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Original Image */}
              <div className="border rounded-lg overflow-hidden relative">
                <Image
                  src={currentItem.originalImageUrl || '/placeholder-document.svg'}
                  alt="Original document"
                  width={800}
                  height={400}
                  className="w-full max-h-96 object-contain bg-gray-50"
                  onError={() => {
                    // Handle error by showing placeholder
                    console.warn('Failed to load image:', currentItem.originalImageUrl)
                  }}
                />
              </div>
              
              {/* Extracted Text */}
              <div>
                <Label className="text-sm font-medium">Extracted Text (OCR)</Label>
                <ScrollArea className="h-48 w-full border rounded-md p-4 mt-2">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {currentItem.extractedText}
                  </pre>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - AI Matches and Corrections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Matching Results</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={enableEditMode}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Mode
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveCorrections}
                    disabled={!Object.keys(editableMatches).length}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {currentItem.suggestedMatches
                    .filter(match => match.confidence >= showConfidenceThreshold)
                    .map((match, index) => {
                      const key = `${match.entityType}-${index}`
                      const editableMatch = editableMatches[key]
                      const isEditing = editableMatch?.isEditing
                      const hasChanges = editableMatch?.correctedText !== editableMatch?.originalText

                      return (
                        <div key={key} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={cn("capitalize", getConfidenceColor(match.confidence))}
                            >
                              {getConfidenceIcon(match.confidence)}
                              <span className="ml-2">{match.entityType}</span>
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {(match.confidence * 100).toFixed(1)}% confidence
                            </div>
                          </div>

                          {/* Original Match */}
                          <div>
                            <Label className="text-xs text-muted-foreground">Suggested Match</Label>
                            <p className="text-sm font-medium">{match.entity}</p>
                          </div>

                          {/* Editable Correction */}
                          {isEditing && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Your Correction {hasChanges && <span className="text-amber-600">(Modified)</span>}
                              </Label>
                              <Input
                                ref={(el) => {
                                  if (el) inputRefs.current[key] = el
                                }}
                                value={editableMatch.correctedText}
                                onChange={(e) => handleTextCorrection(key, e.target.value)}
                                className={cn("mt-1", hasChanges && "border-amber-300 bg-amber-50")}
                                placeholder="Enter correct value..."
                              />
                            </div>
                          )}

                          {/* Alternative Suggestions */}
                          {match.alternatives && match.alternatives.length > 0 && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Alternatives</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {match.alternatives.slice(0, 3).map((alt, altIndex) => (
                                  <Button
                                    key={altIndex}
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-2 py-1 text-xs"
                                    onClick={() => {
                                      if (isEditing) {
                                        handleTextCorrection(key, alt.candidate.text)
                                      }
                                    }}
                                  >
                                    {alt.candidate.text}
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                      {(alt.confidence * 100).toFixed(0)}%
                                    </Badge>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                  {/* Confidence Threshold Slider */}
                  <div className="pt-4 border-t">
                    <Label className="text-sm">
                      Show matches above {(showConfidenceThreshold * 100).toFixed(0)}% confidence
                    </Label>
                    <div className="mt-2 px-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={showConfidenceThreshold}
                        onChange={(e) => setShowConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentItem?.id) {
                    assignToMe(currentItem.id)
                  }
                }}
                disabled={!currentItem}
              >
                <Eye className="h-4 w-4 mr-2" />
                Assign to Me
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(Math.floor(Math.random() * reviewItems.length))}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Random Item
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!currentItem}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject (Ctrl+R)
              </Button>
              <Button
                variant="default"
                onClick={handleApprove}
                disabled={!currentItem}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve (Ctrl+A)
              </Button>
            </div>
          </div>

          {/* Progress indicator */}
          {reviewItems.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Review Progress</span>
                <span>{currentIndex + 1} of {reviewItems.length}</span>
              </div>
              <Progress 
                value={((currentIndex + 1) / reviewItems.length) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AIReviewInterface