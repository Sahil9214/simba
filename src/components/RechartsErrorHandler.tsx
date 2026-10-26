"use client";

import { useEffect } from "react";
import {
  useRechartsErrorBoundary,
  patchCreateSelector,
} from "@/hooks/useRechartsErrorBoundary";

export function RechartsErrorHandler() {
  // Call the hook at the component level, not inside useEffect
  useRechartsErrorBoundary();

  useEffect(() => {
    // Apply the createSelector patch
    patchCreateSelector();
  }, []);

  return null; // This component doesn't render anything
}
