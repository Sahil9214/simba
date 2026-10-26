'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AlertTriangle, Bug, Lightbulb } from 'lucide-react';
import type { ErrorAnalysis } from '@/lib/types/aiAnalytics.types';

interface ErrorAnalysisChartProps {
  errorAnalysis: ErrorAnalysis;
}

const ERROR_TYPE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export default function ErrorAnalysisChart({ errorAnalysis }: ErrorAnalysisChartProps) {
  // Format OCR errors for chart
  const ocrErrorData = errorAnalysis.commonOcrErrors.slice(0, 8); // Top 8 errors
  
  // Format matching failures for chart
  const matchingFailureData = errorAnalysis.commonMatchingFailures.slice(0, 8);
  
  // Format low confidence patterns for chart
  const lowConfidenceData = errorAnalysis.lowConfidencePatterns.slice(0, 6);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      {/* OCR Errors Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OCR Error Frequency Chart */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bug className="h-4 w-4 text-red-600" />
            <h4 className="text-sm font-medium text-gray-700">OCR Error Types</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ocrErrorData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis type="number" className="text-xs" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="errorType" 
                className="text-xs"
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [value, 'Occurrences']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar 
                dataKey="frequency" 
                fill="#ef4444" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Matching Failures Chart */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h4 className="text-sm font-medium text-gray-700">Matching Failures</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={matchingFailureData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis type="number" className="text-xs" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="entity" 
                className="text-xs"
                tick={{ fontSize: 11 }}
                width={60}
              />
              <Tooltip
                formatter={(value: number) => [value, 'Failures']}
                labelFormatter={(label) => `Entity: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar 
                dataKey="frequency" 
                fill="#f97316" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Confidence Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pattern Distribution */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <h4 className="text-sm font-medium text-gray-700">Low Confidence Patterns</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={lowConfidenceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="frequency"
              >
                {lowConfidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ERROR_TYPE_COLORS[index % ERROR_TYPE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, 'Occurrences']}
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

        {/* Improvement Suggestions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Improvement Suggestions</h4>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {errorAnalysis.lowConfidencePatterns.slice(0, 5).map((pattern, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {pattern.pattern.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {pattern.frequency} occurrences
                  </span>
                </div>
                <div className="space-y-1">
                  {pattern.suggestions.map((suggestion, idx) => (
                    <p key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {suggestion}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top OCR Issue */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="h-4 w-4 text-red-600" />
            <h5 className="text-sm font-medium text-red-900">Top OCR Issue</h5>
          </div>
          {ocrErrorData.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-red-800 capitalize">
                {ocrErrorData[0].errorType.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {ocrErrorData[0].frequency} occurrences
              </p>
            </div>
          )}
        </div>

        {/* Top Matching Issue */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h5 className="text-sm font-medium text-orange-900">Top Matching Issue</h5>
          </div>
          {matchingFailureData.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-orange-800 capitalize">
                {matchingFailureData[0].entity} Matching
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {matchingFailureData[0].frequency} failures
              </p>
              {matchingFailureData[0].originalText && (
                <p className="text-xs text-orange-600 mt-1 italic">
                  &ldquo;{matchingFailureData[0].originalText.slice(0, 30)}...&rdquo;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Most Common Pattern */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <h5 className="text-sm font-medium text-yellow-900">Most Common Pattern</h5>
          </div>
          {lowConfidenceData.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-yellow-800 capitalize">
                {lowConfidenceData[0].pattern.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {lowConfidenceData[0].frequency} occurrences
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}