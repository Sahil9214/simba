'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface LabelSelectionHeaderProps {
  title?: string;
  subtitle?: string;
  showChevron?: boolean;
  className?: string;
  segments?: string[];
}

const slugToTitle = (s: string) =>
  s
    .replace(/-/g, ' ')
    .split(' ')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ')
    .trim();

export const LabelSelectionHeader: React.FC<LabelSelectionHeaderProps> = ({
  title,
  subtitle,
  showChevron = true,
  className = '',
  segments
}) => {
  const params = useParams() as {
    sellerShop?: string;
    alllabel?: string;
    labelSelection?: string;
  };

  const urlSegments =
    segments ??
    [
      params?.sellerShop,
      params?.alllabel,
      params?.labelSelection
    ].filter((s): s is string => typeof s === 'string' && s.length > 0);

  // Derived display title/subtitle with sensible fallbacks
  const displayTitle = title;
  const displaySubtitle = subtitle || '';

  // If we have explicit segments, do breadcrumb; otherwise show single title > subtitle
  if (Array.isArray(urlSegments) && urlSegments.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex items-center space-x-2 text-sm md:text-base leading-tight">
          {urlSegments.map((segment, index) => {
            const isLast = index === urlSegments.length - 1;
            return (
              <li
                key={`${segment}-${index}`}
                className="flex items-center space-x-2 min-w-0"
                aria-current={isLast ? 'page' : undefined}
              >
                <span
                  className={`truncate font-inter font-semibold ${isLast ? 'text-red-500' : 'text-neutral-900'
                    }`}
                  title={title}
                >
                  {/* Use actual title for first segment (shop name), slugToTitle for others */}
                  {index === 0 && title ? title : slugToTitle(segment)}
                </span>

                {!isLast && showChevron && (
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-neutral-400"
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Fallback single-title + subtitle layout
  return (
    <div className={`flex items-center gap-2 ${className}`} role="group">
      <div className="font-inter font-semibold text-sm md:text-base truncate">
        {displayTitle}
      </div>

      {showChevron && <ChevronRight size={16} className="text-neutral-400" aria-hidden />}

      <div className="font-inter font-semibold text-sm md:text-base text-red-500 truncate">
        {displaySubtitle}
      </div>
    </div>
  );
};