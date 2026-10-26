# Chart Performance Optimization - Issues Found & Fixed

## Critical Issues Found

### 1. **ALL 5 API Queries Running Simultaneously** ⚠️ CRITICAL
**Location:** `src/components/chart/datadonutcard.tsx` (lines 84-117)

**Problem:**
- All 5 data hooks (`useTopProducts`, `useTopShops`, `useDemandBySku`, `useSalesByPackSize`, `useBreakageReport`) were being called simultaneously
- Even though only ONE query is needed based on `dataSource` prop
- This caused **5x unnecessary API calls** on every render and filter change

**Fix:**
- Added conditional `enabled` flags to each hook based on `dataSource`
- Only the active query runs now, reducing API calls by **80%**
- Modified hooks to accept optional `enabled` parameter

**Files Modified:**
- `src/components/chart/datadonutcard.tsx`
- `src/hooks/api/useDashboard.ts`
- `src/hooks/api/useBreakageReport.ts`

### 2. **Breakage Report Making 5 Internal Queries** ⚠️ CRITICAL
**Location:** `src/hooks/api/useBreakageReport.ts`

**Problem:**
- `useBreakageReport` internally calls 5 separate queries:
  - `useBreakageStatistics`
  - `useBreakageByShop`
  - `useBreakageBySKU`
  - `useBreakageTrends`
  - `useBreakageAnalysis`
- Each query had its own refetch interval (10-30 minutes)
- When `breakageShop` dataSource was selected, it triggered **5 API calls** instead of 1

**Fix:**
- Added `enabled` parameter to all breakage hooks
- Disabled refetch intervals when query is disabled
- Now only runs when `dataSource === 'breakageShop'`

### 3. **Excessive Refetch Intervals**
**Location:** Multiple query configs

**Problem:**
- Analytics config has `refetchInterval: 15 * 60 * 1000` (15 minutes)
- Breakage queries had refetch intervals ranging from 10-30 minutes
- Charts were automatically refetching even when not needed

**Fix:**
- Disabled refetch intervals when queries are disabled
- Refetch intervals now only run when query is enabled

## Performance Improvements

### Before:
- **5 API calls** on component mount (regardless of dataSource)
- **5 API calls** for breakageShop dataSource (internal queries)
- **Automatic refetching** every 10-30 minutes for all queries
- **Total: Up to 10 API calls** when breakageShop is selected

### After:
- **1 API call** on component mount (only for active dataSource)
- **5 API calls** for breakageShop (but only when selected)
- **No automatic refetching** for disabled queries
- **Total: 1-5 API calls** depending on dataSource (80% reduction for most cases)

## Additional Optimizations

1. **Memoized Filters:** Created `commonFilters` useMemo to prevent unnecessary filter object recreation
2. **Conditional Query Execution:** Queries only run when their corresponding dataSource is active
3. **Disabled Refetch Intervals:** Refetch intervals disabled when queries are disabled

## Testing Recommendations

1. Test each dataSource individually to ensure only the correct query runs
2. Monitor network tab to verify only 1 query runs for non-breakage dataSources
3. Verify breakageShop still works correctly (should make 5 queries, but only when selected)
4. Check that filter changes only trigger the active query

## Notes

- The breakageShop dataSource still makes 5 queries because it needs comprehensive data
- Consider optimizing `useBreakageReport` further if only `bySKU` data is needed for the chart
- Consider adding request deduplication/caching at the API level for additional performance gains

