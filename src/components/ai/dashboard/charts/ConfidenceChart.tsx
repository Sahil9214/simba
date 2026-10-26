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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { ConfidenceAnalysis } from '@/lib/types/aiAnalytics.types';

interface ConfidenceChartProps {
  confidenceAnalysis: ConfidenceAnalysis;
  trends: Array<{ date: string; avgConfidence: number }>;
}

const CONFIDENCE_COLORS = {
  high: '#10b981',
  medium: '#f59e0b',
  low: '#ef4444',
};

const ROUTING_COLORS = {
  auto_approved: '#10b981',
  review_queue: '#f59e0b',
  manual_entry: '#ef4444',
};

export default function ConfidenceChart({ confidenceAnalysis, trends }: ConfidenceChartProps) {
  // Format trend data for the chart
  const formattedTrends = trends.map(point => ({
    date: format(parseISO(point.date), 'MMM dd'),
    avgConfidence: point.avgConfidence,
  }));

  // Format confidence distribution for pie chart
  const confidenceDistributionData = [
    { name: 'High (≥0.8)', value: confidenceAnalysis.distribution.high, color: CONFIDENCE_COLORS.high },
    { name: 'Medium (0.5-0.8)', value: confidenceAnalysis.distribution.medium, color: CONFIDENCE_COLORS.medium },
    { name: 'Low (<0.5)', value: confidenceAnalysis.distribution.low, color: CONFIDENCE_COLORS.low },
  ];

  // Format routing distribution for pie chart
  const routingDistributionData = [
    { name: 'Auto Approved', value: confidenceAnalysis.autoApprovedPercentage, color: ROUTING_COLORS.auto_approved },
    { name: 'Review Queue', value: confidenceAnalysis.reviewQueuePercentage, color: ROUTING_COLORS.review_queue },
    { name: 'Manual Entry', value: confidenceAnalysis.manualEntryPercentage, color: ROUTING_COLORS.manual_entry },
  ];

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Confidence Trend Over Time */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Average Confidence Trend</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={formattedTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 1]}
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Confidence Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => [value.toFixed(3), 'Avg Confidence']}
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
              dataKey="avgConfidence"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Confidence Score Distribution</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={confidenceDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {confidenceDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Percentage']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Routing Decisions Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Routing Decisions</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={routingDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {routingDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Percentage']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Summary */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Confidence Summary</h4>
        <div className="space-y-4">
          {/* Overall Average */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Confidence</span>
              <span className="text-lg font-semibold text-gray-900">
                {confidenceAnalysis.averageConfidence.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Confidence Levels */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-800">High Confidence</span>
              </div>
              <span className="text-sm font-medium text-green-900">
                {confidenceAnalysis.distribution.high}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-yellow-800">Medium Confidence</span>
              </div>
              <span className="text-sm font-medium text-yellow-900">
                {confidenceAnalysis.distribution.medium}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-red-800">Low Confidence</span>
              </div>
              <span className="text-sm font-medium text-red-900">
                {confidenceAnalysis.distribution.low}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}