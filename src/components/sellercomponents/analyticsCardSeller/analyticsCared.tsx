import React, { useState, useEffect } from 'react';
import { TrendingUp, Unlink, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import { formatLastVisitDate } from '@/utils/formatLastVisitDate';

interface AnalyticsCardProps {
  className?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void;
  searchTerm?: string;
  selectedLocation?: string;
  analyticsData?: any[];
  cardsData?: any,
  show4?: boolean
}

interface MetricCardProps {
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconSrc?: string;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string | number;
  valueColor?: string;
  isLoading?: boolean;
}

interface AnalyticsData {
  totalShops: number;
  totalSales: number;
  breakageOverall: number;
  lastUpdated: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  iconSrc,
  iconBg,
  iconColor,
  title,
  value,
  valueColor = "#111827",
  isLoading = false
}) => {
  return (
    <div
      className={clsx(
        "flex flex-row items-center p-3 sm:p-4 gap-2 w-full h-auto sm:h-[72px] bg-white border border-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md",
        isLoading && "animate-pulse"
      )}
      style={{
        boxShadow: '0px 1px 4px rgba(12, 12, 13, 0.05)',
        minHeight: '60px'
      }}
    >
      {/* Icon Background */}
      <div
        className="flex flex-row justify-center items-center p-0 w-10 h-10 rounded-lg flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={title}
            width={20}
            height={20}
            style={{ color: iconColor }}
            className="w-5 h-5"
          />
        ) : Icon ? (
          <Icon
            className="w-5 h-5"
            style={{ color: iconColor }}
          />
        ) : null}
      </div>

      {/* Content Container */}
      <div className="flex flex-col items-start p-0 gap-2 md:gap-3 w-auto h-auto md:h-[29px] min-w-0 flex-1">
        {/* Title */}
        <div
          className="w-auto h-auto md:h-[10px] font-inter font-semibold text-xs md:text-sm leading-4 md:leading-5 flex items-center text-gray-500"
          style={{ color: '#757575' }}
        >
          {isLoading ? (
            <div className="w-16 md:w-20 h-3 bg-gray-200 rounded animate-pulse" />
          ) : (
            title
          )}
        </div>

        {/* Value */}
        <div
          className="w-auto h-auto md:h-[11px] text-xs font-inter font-bold lg:text-base leading-4 md:leading-[21px] flex items-end"
          style={{ color: valueColor }}
        >
          {isLoading ? (
            <div className="w-12 md:w-16 h-3 md:h-4 bg-gray-200 rounded animate-pulse" />
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );
};

const AnalyticsCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full max-w-[1500px] h-auto">
      {[1, 2, 3, 4].map((i) => (
        <MetricCard
          key={i}
          iconSrc="/svg/Store.svg"
          iconBg="#f3f4f6"
          iconColor="#9ca3af"
          title="Loading..."
          value="--"
          isLoading={true}
        />
      ))}
    </div>
  );
};

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  className = "",
  isLoading = false,
  isError = false,
  onRefresh,
  show4 = true,

  cardsData,
}) => {

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <AnalyticsCardSkeleton />;
  }

  if (isError || !cardsData) {
    return (
      <div className="flex items-center justify-center py-2 bg-red-50 rounded-xl border border-red-200">
        <div className="text-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm mb-2 font-medium">Failed to load analytics data</p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      iconSrc: '/svg/Store.svg',
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
      title: 'Total Shops',
      value: cardsData.totalShops.toString(),
      valueColor: '#111827'
    },
    {
      icon: TrendingUp,
      iconBg: '#FDF2F8',
      iconColor: '#EC4899',
      title: 'Total Sales Overall',
      value: cardsData.totalSalesUnits.toLocaleString(),
      valueColor: '#111827'
    },
    {
      icon: Unlink,
      iconBg: '#FFFBEB',
      iconColor: '#F97316',
      title: 'Breakage Overall',
      value: cardsData.breakageOverall.toString(),
      valueColor: '#EF4444'
    },
    {
      icon: Clock,
      iconBg: '#FAF5FF',
      iconColor: '#8B5CF6',
      title: 'Last Updated',
      value: formatLastVisitDate(cardsData.lastUpdated === null ? "" : cardsData.lastUpdated) || 'N/A',
      valueColor: '#111827'
    }
  ];
  const displayMetrics = show4 ? metrics : metrics.slice(0, 3);
  return (
    <div
      className={clsx(
        "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 w-full h-auto",
        show4 ? "xl:grid-cols-4" : "xl:grid-cols-3",
        className
      )}
    >
      {displayMetrics.map((metric, index) => (
        <MetricCard
          key={index}
          icon={metric.icon}
          iconSrc={metric.iconSrc}
          iconBg={metric.iconBg}
          iconColor={metric.iconColor}
          title={metric.title}
          value={metric.value}
          valueColor={metric.valueColor}
        />
      ))}
    </div>
  );
};

export default AnalyticsCard;
