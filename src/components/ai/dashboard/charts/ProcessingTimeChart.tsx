'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { ProcessingTimeMetrics } from '@/lib/types/aiAnalytics.types';

interface ProcessingTimeChartProps {
  processingMetrics: ProcessingTimeMetrics;
  trends: Array<{ date: string; avgTime: number }>;
}

export default function ProcessingTimeChart({ processingMetrics, trends }: ProcessingTimeChartProps) {
  // Format trend data for the chart (convert to seconds)
  const formattedTrends = trends.map(point => ({
    date: format(parseISO(point.date), 'MMM dd'),
    avgTime: point.avgTime / 1000, // Convert to seconds
  }));

  // Format processing breakdown data (convert to seconds)
  const breakdownData = [
    { stage: 'OCR Processing', average: processingMetrics.averageOcrTime / 1000, p95: processingMetrics.p95OcrTime / 1000 },
    { stage: 'Fuzzy Matching', average: processingMetrics.averageFuzzyMatchTime / 1000, p95: processingMetrics.p95FuzzyMatchTime / 1000 },
    { stage: 'Total Pipeline', average: processingMetrics.averageTotalTime / 1000, p95: processingMetrics.p95TotalTime / 1000 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Processing Time Trend */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Processing Time Trend</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={formattedTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}s`, 'Avg Processing Time']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="avgTime"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Processing Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Processing Stage Breakdown</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={breakdownData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="stage"
              className="text-xs"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value.toFixed(1)}s`, name === 'average' ? 'Average' : '95th Percentile']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="average" fill="#3b82f6" name="Average" radius={[4, 4, 0, 0]} />
            <Bar dataKey="p95" fill="#ef4444" name="95th Percentile" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* OCR Performance */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-blue-900">OCR Processing</h5>
              <div className="text-xs text-blue-700">ms</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Average:</span>
                <span className="font-medium text-blue-900">{Math.round(processingMetrics.averageOcrTime)}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">95th percentile:</span>
                <span className="font-medium text-blue-900">{Math.round(processingMetrics.p95OcrTime)}ms</span>
              </div>
            </div>
          </div>

          {/* Fuzzy Matching Performance */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-green-900">Fuzzy Matching</h5>
              <div className="text-xs text-green-700">ms</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Average:</span>
                <span className="font-medium text-green-900">{Math.round(processingMetrics.averageFuzzyMatchTime)}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-700">95th percentile:</span>
                <span className="font-medium text-green-900">{Math.round(processingMetrics.p95FuzzyMatchTime)}ms</span>
              </div>
            </div>
          </div>

          {/* Total Performance */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-purple-900">Total Pipeline</h5>
              <div className="text-xs text-purple-700">ms</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Average:</span>
                <span className="font-medium text-purple-900">{Math.round(processingMetrics.averageTotalTime)}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">95th percentile:</span>
                <span className="font-medium text-purple-900">{Math.round(processingMetrics.p95TotalTime)}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}