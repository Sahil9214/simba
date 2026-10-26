import React, { useState, useMemo } from 'react';
import { useInteractiveHeatMap, useHeatMapClustering, useHeatMapRealtime } from '../hooks/api';
import { Loader2, AlertTriangle, Play, Pause, TrendingUp, Target, MapPin } from 'lucide-react';

interface HeatMapProps {
  filters?: {
    searchTerm?: string;
    selectedLocation?: string;
    metricType?: 'sales' | 'penetration' | 'performance' | 'growth';
  };
}

const StockwiseHeatMap: React.FC<HeatMapProps> = ({ filters = {} }) => {
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'penetration' | 'performance' | 'growth'>('sales');
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  // Use our enhanced hooks
  const {
    heatMapData,
    selectedLocation,
    selectedLocationData,
    locationTrends,
    isLoading,
    isError,
    selectLocation,
    clearSelection,
    refetch
  } = useInteractiveHeatMap({ ...filters, metricType: selectedMetric });

  const { data: clustering } = useHeatMapClustering({ ...filters, metricType: selectedMetric });

  const {
    isRealTimeEnabled,
    lastUpdate,
    startRealTime,
    stopRealTime
  } = useHeatMapRealtime({ ...filters, metricType: selectedMetric });

  // Color scale for heat map intensity
  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-green-500';
    if (intensity >= 0.6) return 'bg-yellow-500';
    if (intensity >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get color opacity based on intensity
  const getOpacity = (intensity: number) => {
    return Math.max(0.3, intensity);
  };

  // Handle real-time toggle
  const toggleRealTime = () => {
    if (isRealTimeEnabled) {
      stopRealTime();
      setIsRealTimeActive(false);
    } else {
      startRealTime();
      setIsRealTimeActive(true);
    }
  };

  // Summary statistics
  const summaryStats = useMemo(() => {
    if (!heatMapData) return null;

    const totalLocations = heatMapData.length;
    const highPerformance = heatMapData.filter(item => item.intensity >= 0.8).length;
    const mediumPerformance = heatMapData.filter(item => item.intensity >= 0.5 && item.intensity < 0.8).length;
    const lowPerformance = heatMapData.filter(item => item.intensity < 0.5).length;
    const avgIntensity = heatMapData.reduce((sum, item) => sum + item.intensity, 0) / totalLocations;

    return {
      totalLocations,
      highPerformance,
      mediumPerformance,
      lowPerformance,
      avgIntensity: Math.round(avgIntensity * 100),
    };
  }, [heatMapData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading heat map data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !heatMapData) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load heat map data</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Market Performance Heat Map</h2>
          <p className="text-gray-600">Interactive visualization of sales performance across regions</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="sales">Sales Volume</option>
            <option value="penetration">Market Penetration</option>
            <option value="performance">Performance Index</option>
            <option value="growth">Growth Rate</option>
          </select>

          {/* Real-time Toggle */}
          <button
            onClick={toggleRealTime}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${isRealTimeEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {isRealTimeEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRealTimeEnabled ? 'Real-time ON' : 'Real-time OFF'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{summaryStats.totalLocations}</div>
            <div className="text-sm text-gray-600">Total Locations</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">{summaryStats.highPerformance}</div>
            <div className="text-sm text-green-600">High Performance</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-700">{summaryStats.mediumPerformance}</div>
            <div className="text-sm text-yellow-600">Medium Performance</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-700">{summaryStats.lowPerformance}</div>
            <div className="text-sm text-red-600">Low Performance</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">{summaryStats.avgIntensity}%</div>
            <div className="text-sm text-blue-600">Avg Intensity</div>
          </div>
        </div>
      )}

      {/* Heat Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Heat Map */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Regional Performance Map</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
              {heatMapData.map((item, index) => (
                <div
                  key={`${item.state}-${item.district}`}
                  className={`
                    relative cursor-pointer transition-all duration-200 hover:scale-105
                    ${getIntensityColor(item.intensity)} rounded p-2 min-h-[60px]
                    ${selectedLocation?.name === item.district || selectedLocation?.name === item.state
                      ? 'ring-2 ring-blue-500 ring-offset-1'
                      : ''
                    }
                  `}
                  style={{ opacity: getOpacity(item.intensity) }}
                  onClick={() => selectLocation(item.district, 'district')}
                  title={`${item.district}, ${item.state} - Intensity: ${(item.intensity * 100).toFixed(1)}%`}
                >
                  <div className="text-xs font-medium text-white truncate">
                    {item.district}
                  </div>
                  <div className="text-xs text-white opacity-90">
                    {item.state}
                  </div>
                  <div className="text-xs text-white font-bold">
                    {(item.intensity * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Low (0-40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Medium (40-60%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Good (60-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Excellent (80%+)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Selected Location Details */}
          {selectedLocationData ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Location Details</h3>
                <button
                  onClick={clearSelection}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">District</div>
                  <div className="font-medium">{selectedLocationData.district}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">State</div>
                  <div className="font-medium">{selectedLocationData.state}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Performance Intensity</div>
                  <div className="font-bold text-lg">{(selectedLocationData.intensity * 100).toFixed(1)}%</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-600">Sales Volume</div>
                    <div className="font-medium">{selectedLocationData.metrics.salesVolume.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Shops</div>
                    <div className="font-medium">{selectedLocationData.metrics.shopCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Penetration</div>
                    <div className="font-medium">{(selectedLocationData.metrics.marketPenetration * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Click on a region to view details</p>
              </div>
            </div>
          )}

          {/* Clustering Insights */}
          {clustering?.insights && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Market Insights</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span>Growth Potential: {(clustering.insights.growthPotential * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>Market Maturity: {(clustering.insights.marketMaturity * 100).toFixed(1)}%</span>
                </div>
                {clustering.opportunities && (
                  <div className="mt-3">
                    <div className="text-gray-600 mb-1">Top Opportunities:</div>
                    {clustering.opportunities.slice(0, 2).map((opp, idx) => (
                      <div key={idx} className="text-xs bg-blue-50 text-blue-700 p-2 rounded mb-1">
                        {opp.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Real-time Status */}
          {isRealTimeEnabled && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Real-time Active</span>
              </div>
              {lastUpdate && (
                <div className="text-xs text-green-600 mt-1">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockwiseHeatMap;
