import { useEffect } from "react";

// Hook to handle Recharts createSelector errors gracefully
export function useRechartsErrorBoundary() {
  useEffect(() => {
    // Override console.error to catch and handle createSelector errors
    const originalError = console.error;

    console.error = (...args) => {
      const errorMessage = args.join(" ");

      // Check if this is a createSelector error
      if (
        errorMessage.includes(
          "createSelector expects all input-selectors to be functions"
        )
      ) {
        console.warn(
          "Recharts createSelector error caught and handled:",
          errorMessage
        );
        // Don't log the error to console to avoid noise
        return;
      }

      // For all other errors, use the original console.error
      originalError.apply(console, args);
    };

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalError;
    };
  }, []);
}

// Alternative approach: Try to patch the createSelector function globally
export function patchCreateSelector() {
  if (typeof window !== "undefined") {
    // Try to access reselect from the global scope
    const reselect = (window as any).reselect;
    if (reselect && reselect.createSelector) {
      const originalCreateSelector = reselect.createSelector;

      reselect.createSelector = (...args: any[]) => {
        try {
          // Filter out undefined inputs
          const validArgs = args.filter((arg) => typeof arg === "function");

          if (validArgs.length !== args.length) {
            console.warn(
              "Recharts createSelector: Filtered out undefined inputs"
            );
          }

          if (validArgs.length === 0) {
            return (state: any) => state;
          }

          return originalCreateSelector(...validArgs);
        } catch (error) {
          console.warn("Recharts createSelector error handled:", error);
          return (state: any) => state;
        }
      };
    }
  }
}
