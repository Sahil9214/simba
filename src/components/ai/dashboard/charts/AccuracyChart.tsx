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
import type { AccuracyBreakdown } from '@/lib/types/aiAnalytics.types';

interface AccuracyChartProps {
  accuracyMetrics: AccuracyBreakdown;
  trends: Array<{ date: string; accuracy: number }>;
}

export default function AccuracyChart({ accuracyMetrics, trends }: AccuracyChartProps) {
  // Format trend data for the chart
  const formattedTrends = trends.map(point => ({
    date: format(parseISO(point.date), 'MMM dd'),
    accuracy: point.accuracy,
  }));

  // Format entity breakdown data
  const entityData = [
    { entity: 'SKU', accuracy: accuracyMetrics.bySku },
    { entity: 'Shop', accuracy: accuracyMetrics.byShop },
    { entity: 'Brand', accuracy: accuracyMetrics.byBrand },
    { entity: 'Category', accuracy: accuracyMetrics.byCategory },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Accuracy Trend Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Accuracy Trend Over Time</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={formattedTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
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
              dataKey="accuracy"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Entity Accuracy Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Accuracy by Entity Type</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={entityData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              type="number"
              domain={[0, 100]}
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Accuracy (%)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="category"
              dataKey="entity"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar 
              dataKey="accuracy" 
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Overall Accuracy Summary */}
      <div className="lg:col-span-2">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Overall Performance</h4>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {accuracyMetrics.overall.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Average accuracy across all entity types
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <p className="text-xs text-gray-500">Best Performing</p>
                <p className="text-sm font-medium text-green-700">
                  {entityData.reduce((best, current) => 
                    current.accuracy > best.accuracy ? current : best
                  ).entity}: {entityData.reduce((best, current) => 
                    current.accuracy > best.accuracy ? current : best
                  ).accuracy.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Needs Improvement</p>
                <p className="text-sm font-medium text-red-700">
                  {entityData.reduce((worst, current) => 
                    current.accuracy < worst.accuracy ? current : worst
                  ).entity}: {entityData.reduce((worst, current) => 
                    current.accuracy < worst.accuracy ? current : worst
                  ).accuracy.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}