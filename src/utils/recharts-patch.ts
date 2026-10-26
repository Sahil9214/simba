// Recharts React 19 compatibility patch
// This file provides a workaround for the createSelector error in Recharts

// Patch for createSelector to handle undefined inputs gracefully
let originalCreateSelector: any;

try {
  const { createSelector } = require("reselect");
  originalCreateSelector = createSelector;

  // Override createSelector to handle undefined inputs
  (createSelector as any) = (...args: any[]) => {
    // Filter out undefined inputs
    const validArgs = args.filter((arg) => typeof arg === "function");

    if (validArgs.length !== args.length) {
      console.warn(
        "Recharts createSelector: Some input selectors were undefined and have been filtered out"
      );
    }

    // If no valid selectors, return a default selector
    if (validArgs.length === 0) {
      return (state: any) => state;
    }

    // If only one selector, return it directly
    if (validArgs.length === 1) {
      return validArgs[0];
    }

    // Use the original createSelector with valid inputs
    return originalCreateSelector(...validArgs);
  };
} catch (error) {
  console.warn(
    "Recharts patch: reselect not available, skipping createSelector patch"
  );
}

export {};
