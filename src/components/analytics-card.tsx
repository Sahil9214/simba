// components/analytics-card.tsx
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";

type AnalyticsCardProps = {
    icon: LucideIcon;
    iconBg?: string;        // e.g. "bg-pink-50"
    iconColor?: string;     // e.g. "text-pink-500"
    // Variant A: metric + unit + delta
    value?: number | string;
    unit?: string;
    deltaText?: string;
    deltaColor?: string;    // e.g. "text-green-600"
    // Variant B: entity (name + context + footnote)
    title?: string;         // e.g. "Extra Smooth Can" or "Narela Lampur Rd"
    context?: string;       // e.g. "Top SKU / Product"
    footnote?: string;      // e.g. "911 Units" or "213 Units, 2 Left"
    className?: string;
    bgColor?: string;
    // Enhanced props for animations and trends
    previousValue?: number;
    showTrendIcon?: boolean;
    animateValue?: boolean;
    isLoading?: boolean;
};
export function AnalyticsCard({
    icon: Icon,
    iconBg = "bg-gray-50",
    iconColor = "text-gray-600",
    value,
    unit,
    deltaText,
    deltaColor = "text-gray-600",
    context,
    className,
    bgColor = "bg-green-50",
    previousValue,
    showTrendIcon = true,
    animateValue = true,
    isLoading = false,
}: AnalyticsCardProps) {
    const [displayValue, setDisplayValue] = useState<number | string>(value || 0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Animate value changes
    useEffect(() => {
        if (animateValue && typeof value === 'number' && typeof previousValue === 'number' && value !== previousValue) {
            setIsAnimating(true);
            const duration = 800; // ms
            const steps = 60;
            const increment = (value - previousValue) / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                const currentValue = previousValue + (increment * currentStep);
                setDisplayValue(Math.round(currentValue));

                if (currentStep >= steps) {
                    clearInterval(timer);
                    setDisplayValue(value);
                    setIsAnimating(false);
                }
            }, duration / steps);

            return () => clearInterval(timer);
        } else {
            setDisplayValue(value || 0);
        }
    }, [value, previousValue, animateValue]);

    // Extract trend information from deltaText
    const getTrendIcon = () => {
        if (!showTrendIcon || !deltaText) return null;

        if (deltaText.includes('+') || deltaColor.includes('green')) {
            return <TrendingUp className="w-3 h-3" />;
        } else if (deltaText.includes('-') || deltaColor.includes('red')) {
            return <TrendingDown className="w-3 h-3" />;
        }
        return <Minus className="w-3 h-3" />;
    };

    const cardClass = clsx(
        "flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm",
        {
            "animate-pulse": isLoading,
            "ring-2 ring-blue-200 ring-opacity-50": isAnimating,
        },
        className
    );
    return (
        <div className={cardClass}>
            <div className="flex items-center justify-between">
                <div className={clsx("size-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110", iconBg)}>
                    <Icon className={clsx("w-5 h-5 transition-colors", iconColor)} />
                </div>
                {/* Real-time indicator */}
                <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            </div>
            {value !== undefined ? (
                <div className="min-w-0">
                    {context ? (
                        <p className="font-inter font-medium text-[13.8px] leading-5 text-gray-500">
                            {context}
                        </p>
                    ) : null}
                    <div className="flex items-baseline gap-2">
                        <p className={clsx(
                            "font-inter font-bold text-base leading-7 text-gray-900 transition-all duration-300",
                            isAnimating && "text-blue-600"
                        )}>
                            {typeof displayValue === 'number'
                                ? Intl.NumberFormat("en-IN").format(displayValue)
                                : displayValue
                            }
                        </p>
                        {unit ? (
                            <p className="font-inter text-sm leading-5 text-placeholder-gray transition-opacity duration-200">{unit}</p>
                        ) : null}
                    </div>

                    {deltaText && (
                        <div className={clsx(
                            "font-inter text-sm leading-4 inline-flex items-center gap-1 mt-1 rounded-md py-1 px-2 transition-all duration-200 hover:scale-105",
                            bgColor,
                            deltaColor
                        )}>
                            {getTrendIcon()}
                            <span>{deltaText}</span>
                        </div>
                    )}

                </div>
            ) : (
                <div className="min-w-0">
                    {deltaText && (
                        <div className={clsx(
                            "font-inter text-sm leading-4 inline-flex items-center gap-1 mt-1 rounded-md py-1 px-2 transition-all duration-200 hover:scale-105",
                            bgColor,
                            deltaColor
                        )}>
                            {getTrendIcon()}
                            <span>{deltaText}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
