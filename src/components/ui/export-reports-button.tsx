"use client";

import React from "react";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExportReportsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;
  /**
   * Custom label text (defaults to "Export Reports")
   */
  label?: string;
  /**
   * Size variant of the button
   */
  size?: "sm" | "md" | "lg";
  /**
   * Full width button
   */
  fullWidth?: boolean;
}

/**
 * Standardized Export Reports Button Component
 * 
 * This component provides a consistent export button across the entire application.
 * All export buttons should use this component to maintain consistency.
 * 
 * @example
 * ```tsx
 * <ExportReportsButton onClick={handleExport} />
 * <ExportReportsButton onClick={handleExport} isLoading={isExporting} />
 * <ExportReportsButton onClick={handleExport} label="Export Data" size="lg" />
 * ```
 */
export const ExportReportsButton = React.forwardRef<
  HTMLButtonElement,
  ExportReportsButtonProps
>(
  (
    {
      className,
      isLoading = false,
      label = "Export Reports",
      size = "md",
      fullWidth = false,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-2 h-9 text-xs",
      md: "px-4 py-2.5 h-10 text-sm",
      lg: "px-5 py-3 h-11 text-base",
    };

    const iconSizes = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          "flex flex-row justify-center items-center gap-2",
          "bg-gradient-to-b from-[#FF4250] to-[#D73742]",
          "rounded-lg shadow-sm",
          "hover:opacity-90 transition-opacity",
          "cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          className
        )}
        style={{
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        }}
        aria-label={label}
        title={label}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], "text-[#FAFAFA] animate-spin")} />
        ) : (
          <Download className={cn(iconSizes[size], "text-[#FAFAFA]")} />
        )}
        <span className="font-normal text-[#FAFAFA] whitespace-nowrap">
          {isLoading ? "Exporting..." : label}
        </span>
      </button>
    );
  }
);

ExportReportsButton.displayName = "ExportReportsButton";

