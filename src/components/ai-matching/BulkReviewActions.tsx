'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Search, 
  ArrowUpDown,
  Clock,
  AlertTriangle,
  BarChart3,
  Users,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useReviewQueue } from '@/hooks/api/useAIMatching'
import type { ReviewQueueItem } from '@/hooks/api/useAIMatching'

interface BulkReviewActionsProps {
  className?: string
  onBulkAction?: (action: 'approve' | 'reject', itemIds: string[]) => void
}

interface BulkFilters {
  status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'all'
  priority?: 'high' | 'medium' | 'low' | 'all'
  confidence?: 'high' | 'medium' | 'low' | 'all'
  assignee?: string | 'all'
  dateRange?: '24h' | '7d' | '30d' | 'all'
}

interface SortConfig {
  key: keyof ReviewQueueItem | 'confidence'
  direction: 'asc' | 'desc'
}

export function BulkReviewActions({ className, onBulkAction }: BulkReviewActionsProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<BulkFilters>({
    status: 'pending',
    priority: 'all',
    confidence: 'all',
    assignee: 'all',
    dateRange: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'createdAt', 
    direction: 'desc' 
  })

  // API hooks - convert 'all' values to undefined for the API
  const apiFilters = {
    status: filters.status === 'all' ? undefined : filters.status,
    priority: filters.priority === 'all' ? undefined : filters.priority,
    assignedTo: filters.assignee === 'all' ? undefined : filters.assignee
  }
  const { data: reviewItems, isLoading, approveItem, rejectItem } = useReviewQueue(apiFilters)

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let items = reviewItems || []

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.extractedText.toLowerCase().includes(query) ||
        item.suggestedMatches.some(match => 
          match.entity.toLowerCase().includes(query)
        )
      )
    }

    // Confidence filter
    if (filters.confidence !== 'all') {
      items = items.filter(item => {
        const avgConfidence = item.suggestedMatches.length > 0
          ? item.suggestedMatches.reduce((sum, match) => sum + match.confidence, 0) / item.suggestedMatches.length
          : 0

        switch (filters.confidence) {
          case 'high': return avgConfidence >= 0.8
          case 'medium': return avgConfidence >= 0.5 && avgConfidence < 0.8
          case 'low': return avgConfidence < 0.5
          default: return true
        }
      })
    }

    // Sort items
    items.sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortConfig.key === 'confidence') {
        aValue = a.suggestedMatches.length > 0
          ? a.suggestedMatches.reduce((sum, match) => sum + match.confidence, 0) / a.suggestedMatches.length
          : 0
        bValue = b.suggestedMatches.length > 0
          ? b.suggestedMatches.reduce((sum, match) => sum + match.confidence, 0) / b.suggestedMatches.length
          : 0
      } else {
        aValue = a[sortConfig.key]
        bValue = b[sortConfig.key]
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return items
  }, [reviewItems, searchQuery, filters, sortConfig])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredAndSortedItems.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelection = new Set(selectedItems)
    if (checked) {
      newSelection.add(itemId)
    } else {
      newSelection.delete(itemId)
    }
    setSelectedItems(newSelection)
  }

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) {
      toast.error('No items selected')
      return
    }

    try {
      const itemIds = Array.from(selectedItems)
      for (const itemId of itemIds) {
        await approveItem({ itemId })
      }
      
      onBulkAction?.('approve', itemIds)
      setSelectedItems(new Set())
      toast.success(`${itemIds.length} items approved`)
    } catch (error) {
      toast.error('Failed to approve items')
    }
  }

  const handleBulkReject = async () => {
    if (selectedItems.size === 0) {
      toast.error('No items selected')
      return
    }

    const reason = prompt('Please provide a reason for bulk rejection:')
    if (!reason) return

    try {
      const itemIds = Array.from(selectedItems)
      for (const itemId of itemIds) {
        await rejectItem({ itemId, reason })
      }
      
      onBulkAction?.('reject', itemIds)
      setSelectedItems(new Set())
      toast.success(`${itemIds.length} items rejected`)
    } catch (error) {
      toast.error('Failed to reject items')
    }
  }

  // Filter presets
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAvgConfidence = (item: ReviewQueueItem) => {
    if (item.suggestedMatches.length === 0) return 0
    return item.suggestedMatches.reduce((sum, match) => sum + match.confidence, 0) / item.suggestedMatches.length
  }

  const handleSort = (key: keyof ReviewQueueItem | 'confidence') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bulk Review Actions</span>
            <Badge variant="secondary">
              {filteredAndSortedItems.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search extracted text or matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Priority</Label>
              <Select 
                value={filters.priority} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Confidence</Label>
              <Select 
                value={filters.confidence} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, confidence: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="high">High (≥80%)</SelectItem>
                  <SelectItem value="medium">Medium (50-80%)</SelectItem>
                  <SelectItem value="low">Low (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Date Range</Label>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  status: 'all',
                  priority: 'all',
                  confidence: 'all',
                  assignee: 'all',
                  dateRange: 'all'
                })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection and Bulk Actions */}
      {filteredAndSortedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedItems.size === filteredAndSortedItems.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">
                  Select All ({selectedItems.size} selected)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={selectedItems.size === 0}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Bulk Reject ({selectedItems.size})
                </Button>
                <Button
                  onClick={handleBulkApprove}
                  disabled={selectedItems.size === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Bulk Approve ({selectedItems.size})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Review Items</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('createdAt')}
                className="text-xs"
              >
                Date <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('priority')}
                className="text-xs"
              >
                Priority <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('confidence')}
                className="text-xs"
              >
                Confidence <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items match the current filters
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedItems.map((item) => {
                  const avgConfidence = getAvgConfidence(item)
                  const isSelected = selectedItems.has(item.id)

                  return (
                    <div 
                      key={item.id}
                      className={cn(
                        "border rounded-lg p-4 space-y-3 transition-colors",
                        isSelected && "bg-blue-50 border-blue-200"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant={item.status === 'pending' ? 'default' : 'secondary'}>
                                {item.status}
                              </Badge>
                              <Badge variant={
                                item.priority === 'high' ? 'destructive' : 
                                item.priority === 'medium' ? 'default' : 'secondary'
                              }>
                                {item.priority}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className={getConfidenceColor(avgConfidence)}
                              >
                                {(avgConfidence * 100).toFixed(0)}% confidence
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {item.extractedText.substring(0, 150)}...
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              {item.suggestedMatches.slice(0, 3).map((match, index) => (
                                <div key={index} className="text-xs">
                                  <span className="font-medium">{match.entityType}:</span>{' '}
                                  <span className="text-muted-foreground">{match.entity}</span>
                                  <Badge variant="secondary" className="ml-1 text-xs">
                                    {(match.confidence * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                              ))}
                              {item.suggestedMatches.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{item.suggestedMatches.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                          {item.assignedTo && (
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              Assigned
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredAndSortedItems.length}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredAndSortedItems.filter(item => getAvgConfidence(item) >= 0.8).length}
                </p>
                <p className="text-xs text-muted-foreground">High Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredAndSortedItems.filter(item => {
                    const conf = getAvgConfidence(item)
                    return conf >= 0.5 && conf < 0.8
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">Medium Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredAndSortedItems.filter(item => getAvgConfidence(item) < 0.5).length}
                </p>
                <p className="text-xs text-muted-foreground">Low Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BulkReviewActions