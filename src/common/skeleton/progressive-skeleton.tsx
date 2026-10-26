"use client";

import React, { useState, useEffect } from "react";
import { clsx } from "clsx";

// Progressive skeleton that reveals content gradually
export interface ProgressiveSkeletonProps {
  stages: {
    key: string;
    duration: number;
    component: React.ComponentType<any>;
    props?: any;
  }[];
  totalDuration?: number;
  onComplete?: () => void;
  className?: string;
  autoStart?: boolean;
}

export function ProgressiveSkeleton({
  stages,
  totalDuration,
  onComplete,
  className,
  autoStart = true
}: ProgressiveSkeletonProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(autoStart);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());

  const duration = totalDuration || stages.reduce((sum, stage) => sum + stage.duration, 0);

  useEffect(() => {
    if (!isAnimating || currentStage >= stages.length) {
      if (currentStage >= stages.length && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCompletedStages(prev => new Set([...prev, currentStage]));
      setCurrentStage(prev => prev + 1);
    }, stages[currentStage].duration);

    return () => clearTimeout(timer);
  }, [currentStage, isAnimating, stages, onComplete]);

  const start = () => {
    setCurrentStage(0);
    setCompletedStages(new Set());
    setIsAnimating(true);
  };

  const reset = () => {
    setCurrentStage(0);
    setCompletedStages(new Set());
    setIsAnimating(false);
  };

  return (
    <div className={clsx("relative", className)}>
      {stages.map((stage, index) => {
        const StageComponent = stage.component;
        const isActive = index <= currentStage;
        const isCompleted = completedStages.has(index);

        return (
          <div
            key={stage.key}
            className={clsx(
              "transition-all duration-500",
              isActive ? "opacity-100" : "opacity-30",
              isCompleted && "animate-pulse"
            )}
            style={{
              animationDelay: `${index * 100}ms`,
              zIndex: stages.length - index
            }}
          >
            <StageComponent {...(stage.props || {})} />
          </div>
        );
      })}

      {/* Progress indicator */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        {stages.map((_, index) => (
          <div
            key={index}
            className={clsx(
              "w-2 h-2 rounded-full transition-all duration-300",
              index < currentStage
                ? "bg-green-500"
                : index === currentStage
                ? "bg-blue-500 animate-pulse"
                : "bg-gray-300"
            )}
          />
        ))}
      </div>

      {/* Control buttons (for development/testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={start}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
          >
            Start
          </button>
          <button
            onClick={reset}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

// Staggered animation component
export interface StaggeredSkeletonProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationType?: "fade" | "slide" | "scale";
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function StaggeredSkeleton({
  children,
  staggerDelay = 100,
  animationType = "fade",
  direction = "up",
  className
}: StaggeredSkeletonProps) {
  const getAnimationClass = (type: string, dir: string) => {
    const animations = {
      fade: "animate-pulse",
      slide: {
        up: "animate-slide-up",
        down: "animate-slide-down",
        left: "animate-slide-left",
        right: "animate-slide-right"
      }[dir] || "animate-slide-up",
      scale: "animate-scale"
    };

    return animations[type as keyof typeof animations] || animations.fade;
  };

  return (
    <div className={clsx("space-y-4", className)}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={clsx(
            "transition-all duration-500",
            getAnimationClass(animationType, direction)
          )}
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: "backwards"
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Shimmer effect component
export function ShimmerSkeleton({
  width,
  height,
  className,
  rounded = true,
  animated = true
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  animated?: boolean;
}) {
  return (
    <div
      className={clsx(
        "bg-gray-200 relative overflow-hidden",
        rounded && "rounded",
        animated && "animate-pulse",
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    >
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer -skew-x-12" />
      )}
    </div>
  );
}

// Pulse wave skeleton
export function PulseWaveSkeleton({
  children,
  intensity = 0.6,
  speed = 2,
  className
}: {
  children: React.ReactNode;
  intensity?: number;
  speed?: number;
  className?: string;
}) {
  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {children}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse"
        style={{
          animationDuration: `${speed}s`,
          opacity: intensity
        }}
      />
    </div>
  );
}

// Skeleton with breathing animation
export function BreathingSkeleton({
  children,
  className,
  breatheScale = 1.02,
  duration = 3
}: {
  children: React.ReactNode;
  className?: string;
  breatheScale?: number;
  duration?: number;
}) {
  return (
    <div
      className={clsx("animate-breathing", className)}
      style={{
        animationDuration: `${duration}s`,
        '--breathing-scale': breatheScale.toString()
      } as React.CSSProperties & { '--breathing-scale': string }}
    >
      {children}
    </div>
  );
}

// Loading dots animation
export function LoadingDots({
  count = 3,
  size = "sm",
  color = "gray",
  className
}: {
  count?: number;
  size?: "xs" | "sm" | "md" | "lg";
  color?: "gray" | "blue" | "green" | "red" | "yellow";
  className?: string;
}) {
  const sizeClasses = {
    xs: "w-1 h-1",
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const colorClasses = {
    gray: "bg-gray-400",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500"
  };

  return (
    <div className={clsx("flex items-center gap-1", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={clsx(
            "rounded-full animate-bounce",
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
}

// Skeleton with typing effect
export function TypingSkeleton({
  text,
  speed = 50,
  className,
  showCursor = true
}: {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
}) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={clsx("font-mono", className)}>
      {displayText}
      {isTyping && showCursor && (
        <span className="animate-blink ml-0.5">|</span>
      )}
    </span>
  );
}

// Progress bar skeleton
export function ProgressBarSkeleton({
  progress,
  height = 4,
  showLabel = false,
  labelPosition = "top",
  color = "blue",
  backgroundColor = "gray-200",
  className
}: {
  progress: number;
  height?: number;
  showLabel?: boolean;
  labelPosition?: "top" | "bottom" | "inside";
  color?: string;
  backgroundColor?: string;
  className?: string;
}) {
  const progressValue = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={clsx("w-full", className)}>
      {showLabel && labelPosition === "top" && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Loading...</span>
          <span>{progressValue}%</span>
        </div>
      )}

      <div
        className={clsx("w-full rounded-full overflow-hidden", `bg-${backgroundColor}`)}
        style={{ height: `${height}px` }}
      >
        <div
          className={clsx(
            "h-full transition-all duration-300 ease-out rounded-full",
            `bg-${color}-500`
          )}
          style={{ width: `${progressValue}%` }}
        >
          {showLabel && labelPosition === "inside" && progressValue > 20 && (
            <div className="h-full flex items-center justify-center text-xs text-white font-medium">
              {progressValue}%
            </div>
          )}
        </div>
      </div>

      {showLabel && labelPosition === "bottom" && (
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Loading...</span>
          <span>{progressValue}%</span>
        </div>
      )}
    </div>
  );
}

export default ProgressiveSkeleton;