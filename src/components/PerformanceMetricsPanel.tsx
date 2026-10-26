import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, MapPin, Percent } from 'lucide-react';
import type { HeatMapData } from '../lib/types/heatmap.types';

interface PerformanceMetricsPanelProps {
  data: HeatMapData[];
  selectedLocation?: HeatMapData | null;
  clustering?: any;
}

export const PerformanceMetricsPanel: React.FC<PerformanceMetricsPanelProps> = ({
  data,
  selectedLocation,
  clustering
}) => {
  const calculateMetrics = () => {
    if (!data.length) return null;

    const totalSales = data.reduce((sum, item) => sum + item.metrics.salesVolume, 0);
    const totalShops = data.reduce((sum, item) => sum + item.metrics.shopCount, 0);
    const avgPenetration = data.reduce((sum, item) => sum + item.metrics.marketPenetration, 0) / data.length;
    const avgGrowth = data.reduce((sum, item) => sum + item.metrics.growthRate, 0) / data.length;

    const topPerformer = data.reduce((max, item) =>
      item.intensity > max.intensity ? item : max, data[0]
    );

    const weakestPerformer = data.reduce((min, item) =>
      item.intensity < min.intensity ? item : min, data[0]
    );

    return {
      totalSales,
      totalShops,
      avgPenetration,
      avgGrowth,
      topPerformer,
      weakestPerformer
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-placeholder-gray text-left font-inter">No data available</p>
      </div>
    );
  }

  return (
    <div className="font-inter space-y-4">
      {/* Overall Performance Metrics */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3 font-inter flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Performance Overview
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-700 font-inter">
              {metrics.totalSales.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600 font-inter flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Total Sales
            </div>
          </div>

          <div className="text-left">
            <div className="text-2xl font-bold text-blue-700 font-inter">
              {metrics.totalShops.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600 font-inter flex items-center gap-1">
              <Users className="h-3 w-3" />
              Active Shops
            </div>
          </div>

          <div className="text-left">
            <div className="text-2xl font-bold text-blue-700 font-inter">
              {(metrics.avgPenetration * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600 font-inter flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Avg Penetration
            </div>
          </div>

          <div className="text-left">
            <div className={`text-2xl font-bold font-inter ${metrics.avgGrowth >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
              {metrics.avgGrowth >= 0 ? '+' : ''}{metrics.avgGrowth.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600 font-inter flex items-center gap-1">
              {metrics.avgGrowth >= 0 ?
                <TrendingUp className="h-3 w-3" /> :
                <TrendingDown className="h-3 w-3" />
              }
              Avg Growth
            </div>
          </div>
        </div>
      </div>

      {/* Top & Bottom Performers */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2 font-inter flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Performer
          </h4>
          <div className="space-y-1">
            <div className="font-semibold text-green-900 font-inter">
              {metrics.topPerformer.district}, {metrics.topPerformer.state}
            </div>
            <div className="text-sm text-green-700 font-inter">
              Intensity: {(metrics.topPerformer.intensity * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-green-700 font-inter">
              Sales: {metrics.topPerformer.metrics.salesVolume.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2 font-inter flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Needs Attention
          </h4>
          <div className="space-y-1">
            <div className="font-semibold text-red-900 font-inter">
              {metrics.weakestPerformer.district}, {metrics.weakestPerformer.state}
            </div>
            <div className="text-sm text-red-700 font-inter">
              Intensity: {(metrics.weakestPerformer.intensity * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-red-700 font-inter">
              Sales: {metrics.weakestPerformer.metrics.salesVolume.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Location Deep Dive */}
      {selectedLocation && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-3 font-inter flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Deep Dive
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700 font-inter">Performance Score</span>
              <span className="font-semibold text-purple-900 font-inter">
                {(selectedLocation.intensity * 100).toFixed(1)}/100
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700 font-inter">Market Position</span>
              <span className="font-semibold text-purple-900 font-inter">
                {selectedLocation.intensity >= 0.8 ? 'Leader' :
                  selectedLocation.intensity >= 0.6 ? 'Strong' :
                    selectedLocation.intensity >= 0.4 ? 'Average' : 'Weak'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700 font-inter">Growth Trend</span>
              <span className={`font-semibold font-inter ${selectedLocation.metrics.growthRate >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                {selectedLocation.metrics.growthRate >= 0 ? '+' : ''}{selectedLocation.metrics.growthRate.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700 font-inter">Revenue per Shop</span>
              <span className="font-semibold text-purple-900 font-inter">
                ₹{(selectedLocation.metrics.averagePerformance).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Clustering Insights */}
      {clustering?.insights && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-3 font-inter">
            Market Clustering Analysis
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-700 font-inter">Growth Potential Markets</span>
              <span className="font-semibold text-amber-900 font-inter">
                {(clustering.insights.growthPotential * 100).toFixed(0)}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-amber-700 font-inter">Mature Markets</span>
              <span className="font-semibold text-amber-900 font-inter">
                {(clustering.insights.marketMaturity * 100).toFixed(0)}%
              </span>
            </div>

            {clustering.clusterStats && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <div className="text-xs text-amber-600 font-inter">
                  Dominant Cluster: {clustering.insights.dominantCluster?.name}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
