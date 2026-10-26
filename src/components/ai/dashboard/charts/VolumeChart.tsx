'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface VolumeChartProps {
  volumeTrend: Array<{ date: string; processed: number; reviewed: number }>;
}

export default function VolumeChart({ volumeTrend }: VolumeChartProps) {
  // Format data for the chart
  const formattedData = volumeTrend.map(point => ({
    date: format(parseISO(point.date), 'MMM dd'),
    processed: point.processed,
    reviewed: point.reviewed,
    pending: Math.max(0, point.processed - point.reviewed), // Calculate pending reviews
  }));

  // Calculate totals for summary
  const totals = formattedData.reduce(
    (acc, day) => ({
      totalProcessed: acc.totalProcessed + day.processed,
      totalReviewed: acc.totalReviewed + day.reviewed,
      totalPending: acc.totalPending + day.pending,
    }),
    { totalProcessed: 0, totalReviewed: 0, totalPending: 0 }
  );

  const reviewCompletionRate = totals.totalProcessed > 0 
    ? ((totals.totalReviewed / totals.totalProcessed) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Volume Trend Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Processing & Review Volume</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const labels = {
                  processed: 'Items Processed',
                  reviewed: 'Items Reviewed',
                  pending: 'Items Pending'
                };
                return [value, labels[name as keyof typeof labels] || name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            
            {/* Processed items as bars */}
            <Bar 
              dataKey="processed" 
              fill="#3b82f6" 
              name="Processed"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            
            {/* Reviewed items as line */}
            <Line
              type="monotone"
              dataKey="reviewed"
              stroke="#10b981"
              strokeWidth={3}
              name="Reviewed"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
            />
            
            {/* Pending items as line */}
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Pending"
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: 'white' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Processed */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Total Processed</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {totals.totalProcessed.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="h-6 w-6 bg-blue-500 rounded"></div>
            </div>
          </div>
        </div>

        {/* Total Reviewed */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Total Reviewed</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {totals.totalReviewed.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="h-6 w-6 bg-green-500 rounded"></div>
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">
                {totals.totalPending.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <div className="h-6 w-6 bg-yellow-500 rounded"></div>
            </div>
          </div>
        </div>

        {/* Review Completion Rate */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {reviewCompletionRate.toFixed(1)}%
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="h-6 w-6 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Performance Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Daily Performance Breakdown</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Busiest Day */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Highest Processing Volume</p>
              {formattedData.length > 0 && (() => {
                const busiestDay = formattedData.reduce((max, day) => 
                  day.processed > max.processed ? day : max
                );
                return (
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{busiestDay.date}</p>
                    <p className="text-xs text-gray-600">{busiestDay.processed} items processed</p>
                  </div>
                );
              })()}
            </div>

            {/* Most Reviews Completed */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Most Reviews Completed</p>
              {formattedData.length > 0 && (() => {
                const mostReviewsDay = formattedData.reduce((max, day) => 
                  day.reviewed > max.reviewed ? day : max
                );
                return (
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{mostReviewsDay.date}</p>
                    <p className="text-xs text-gray-600">{mostReviewsDay.reviewed} reviews completed</p>
                  </div>
                );
              })()}
            </div>

            {/* Average Daily Volume */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Average Daily Volume</p>
              {formattedData.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {Math.round(totals.totalProcessed / formattedData.length)} items/day
                  </p>
                  <p className="text-xs text-gray-600">
                    {Math.round(totals.totalReviewed / formattedData.length)} reviews/day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}