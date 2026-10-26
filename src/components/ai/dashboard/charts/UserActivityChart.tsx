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
import { Users, Clock, CheckCircle, XCircle, Edit } from 'lucide-react';
import type { UserReviewPatterns } from '@/lib/types/aiAnalytics.types';

interface UserActivityChartProps {
  userReviewPatterns: UserReviewPatterns;
}

const REVIEW_COLORS = {
  approved: '#10b981',
  rejected: '#ef4444',
  corrected: '#f59e0b',
};

export default function UserActivityChart({ userReviewPatterns }: UserActivityChartProps) {
  // Format review pattern data for pie chart
  const reviewPatternData = [
    { name: 'Approved', value: userReviewPatterns.approvalRate, color: REVIEW_COLORS.approved },
    { name: 'Rejected', value: userReviewPatterns.rejectionRate, color: REVIEW_COLORS.rejected },
    { name: 'Corrected', value: userReviewPatterns.correctionRate, color: REVIEW_COLORS.corrected },
  ];

  // Format top reviewers data for bar chart (limit to top 10)
  const topReviewersData = userReviewPatterns.mostActiveReviewers.slice(0, 10).map(reviewer => ({
    ...reviewer,
    displayName: `User ${reviewer.userId.slice(-4)}`, // Show last 4 chars for anonymity
  }));

  // Calculate review time in minutes
  const avgReviewTimeMinutes = userReviewPatterns.averageReviewTime / 60;

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    
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
    <div className="space-y-8">
      {/* Review Patterns Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Pattern Distribution */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-medium text-gray-700">Review Pattern Distribution</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={reviewPatternData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reviewPatternData.map((entry, index) => (
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

        {/* Top Reviewers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-700">Top Reviewers by Volume</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topReviewersData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis type="number" className="text-xs" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="displayName"
                className="text-xs"
                tick={{ fontSize: 11 }}
                width={60}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'reviewCount') return [value, 'Reviews'];
                  if (name === 'accuracy') return [`${value}%`, 'Accuracy'];
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="reviewCount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Total Reviews</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {userReviewPatterns.totalReviews.toLocaleString()}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Average Review Time */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">Avg Review Time</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {avgReviewTimeMinutes.toFixed(1)}m
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        {/* Approval Rate */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Approval Rate</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {userReviewPatterns.approvalRate}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Correction Rate */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">Correction Rate</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">
                {userReviewPatterns.correctionRate}%
              </p>
            </div>
            <Edit className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Detailed Reviewer Performance Table */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Detailed Reviewer Performance</h4>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Reviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topReviewersData.map((reviewer, index) => (
                  <tr key={reviewer.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reviewer.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reviewer.reviewCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">{reviewer.accuracy}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              reviewer.accuracy >= 90 ? 'bg-green-500' :
                              reviewer.accuracy >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${reviewer.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reviewer.accuracy >= 90 ? 'bg-green-100 text-green-800' :
                        reviewer.accuracy >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        reviewer.accuracy >= 70 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reviewer.accuracy >= 90 ? 'Excellent' :
                         reviewer.accuracy >= 80 ? 'Good' :
                         reviewer.accuracy >= 70 ? 'Fair' : 'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
                {topReviewersData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No reviewer data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Quality Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Review Quality Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quality Indicators */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">Approved Reviews</span>
              </div>
              <span className="text-sm font-medium text-green-900">
                {userReviewPatterns.approvalRate}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">Rejected Reviews</span>
              </div>
              <span className="text-sm font-medium text-red-900">
                {userReviewPatterns.rejectionRate}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Corrected Reviews</span>
              </div>
              <span className="text-sm font-medium text-yellow-900">
                {userReviewPatterns.correctionRate}%
              </span>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="md:col-span-2">
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Performance Insights</h5>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>
                    <span className="font-medium">Most Active Reviewer:</span>{' '}
                    {topReviewersData.length > 0 && `${topReviewersData[0].displayName} (${topReviewersData[0].reviewCount} reviews)`}
                  </p>
                  <p>
                    <span className="font-medium">Highest Accuracy:</span>{' '}
                    {topReviewersData.length > 0 && 
                      (() => {
                        const bestAccuracy = Math.max(...topReviewersData.map(r => r.accuracy));
                        const bestReviewer = topReviewersData.find(r => r.accuracy === bestAccuracy);
                        return `${bestReviewer?.displayName} (${bestAccuracy}%)`;
                      })()
                    }
                  </p>
                  <p>
                    <span className="font-medium">Average Review Time:</span>{' '}
                    {avgReviewTimeMinutes.toFixed(1)} minutes per review
                  </p>
                  <p>
                    <span className="font-medium">Total Reviewers:</span>{' '}
                    {userReviewPatterns.mostActiveReviewers.length} active reviewers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}