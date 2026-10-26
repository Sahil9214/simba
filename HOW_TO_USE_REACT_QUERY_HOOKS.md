# How to Use React Query Hooks with Dynamic Parameters

## Problem
When you have a React Query hook that requires parameters (like `shopId` and `lastVistedDate`), you can't call it conditionally or inside a function. Hooks must be called at the top level of your component.

## Solution Pattern

### ❌ Wrong Way (What You Were Trying)
```typescript
// This doesn't work - hooks can't be called inside functions
const showShopDetail = async (shop: { shopId: string, lastVistedDate: string }) => {
    const { data } = useStaffPanelShopDetail(shop.shopId, shop.lastVistedDate); // ❌ ERROR!
    // ... use data
}
```

### ✅ Correct Way (Using State to Control Query)

```typescript
// 1. Create state to hold the parameters
const [selectedShopParams, setSelectedShopParams] = useState<{
    shopId: string;
    lastVistedDate: string
} | null>(null);

// 2. Call the hook at the top level with the state
const {
    data: shopDetailData,
    isLoading: isLoadingShopDetail,
    isError: isErrorShopDetail
} = useStaffPanelShopDetail(
    selectedShopParams?.shopId || '',
    selectedShopParams?.lastVistedDate || '',
    !!selectedShopParams // Only fetch when params are set (enabled flag)
);

// 3. Handle the data when it arrives
useEffect(() => {
    if (shopDetailData?.success && shopDetailData?.data) {
        console.log("Data received:", shopDetailData);
        // Do something with the data
        setShopTable(shopDetailData.data);
        setIsStockModalOpen(true);
    }
}, [shopDetailData]);

// 4. Handle errors
useEffect(() => {
    if (isErrorShopDetail) {
        showToast('error', 'Failed to fetch shop detail');
        setSelectedShopParams(null); // Reset on error
    }
}, [isErrorShopDetail]);

// 5. Create a function that triggers the query by setting state
const showShopDetail = (shop: { shopId: string, lastVistedDate: string }) => {
    setSelectedShopParams({
        shopId: shop.shopId,
        lastVistedDate: shop.lastVistedDate
    });
};
```

## How It Works

1. **State Management**: Use `useState` to hold the parameters you want to pass to the hook
2. **Hook Call**: Call the hook at the top level with state values (or empty strings if null)
3. **Enabled Flag**: Use the `enabled` option to control when the query runs
4. **Side Effects**: Use `useEffect` to react to data changes
5. **Trigger Function**: Create a regular function that updates the state to trigger the query

## Key Concepts

### The `enabled` Flag
```typescript
enabled: !!selectedShopParams // Only run query when this is true
```
- When `selectedShopParams` is `null` → `enabled: false` → Query doesn't run
- When `selectedShopParams` is set → `enabled: true` → Query runs automatically

### Why This Works
- React Query automatically re-runs the query when:
  - The `queryKey` changes (includes `shopId` and `lastVistedDate`)
  - The `enabled` flag changes from `false` to `true`
- You don't need to manually call `refetch()`

## Complete Example: completeSellerProfile.tsx

```typescript
export function CompleteSellerProfile() {
    // State to control when to fetch shop details
    const [selectedShopParams, setSelectedShopParams] = useState<{
        shopId: string;
        lastVistedDate: string;
    } | null>(null);

    // Hook is called at top level
    const {
        data: shopDetailData,
        isLoading: isLoadingShopDetail,
        isError: isErrorShopDetail
    } = useStaffPanelShopDetail(
        selectedShopParams?.shopId || '',
        selectedShopParams?.lastVistedDate || '',
        !!selectedShopParams
    );

    // React to data changes
    useEffect(() => {
        if (shopDetailData?.success && shopDetailData?.data) {
            setShopTable(shopDetailData.data);
            setIsStockModalOpen(true);
        }
    }, [shopDetailData]);

    // React to errors
    useEffect(() => {
        if (isErrorShopDetail) {
            showToast('error', 'Failed to fetch shop detail');
            setSelectedShopParams(null);
        }
    }, [isErrorShopDetail]);

    // Function to trigger the query
    const showShopDetail = (shop: { shopId: string, lastVistedDate: string }) => {
        setSelectedShopParams({
            shopId: shop.shopId,
            lastVistedDate: shop.lastVistedDate
        });
    };

    // Use in your JSX
    return (
        <div>
            {shops.map(shop => (
                <ShopCard
                    key={shop.id}
                    shop={shop}
                    onClick={() => showShopDetail(shop)}
                />
            ))}

            {isLoadingShopDetail && <LoadingSpinner />}
        </div>
    );
}
```

## Hook Implementation (useAllShops.ts)

```typescript
export function useStaffPanelShopDetail(
    shopId: string,
    lastVistedDate: string,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ['staff-panel-shopDetail-by-id', shopId, lastVistedDate],
        queryFn: () => staffPanelShopDetail(shopId, lastVistedDate),
        retry: 3,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled: enabled && !!shopId && !!lastVistedDate, // Only run when enabled and params exist
    });
}
```

## Benefits of This Approach

1. ✅ **Follows React Rules**: Hooks are called at the top level
2. ✅ **Automatic Caching**: React Query caches results automatically
3. ✅ **Loading States**: Built-in `isLoading` state
4. ✅ **Error Handling**: Built-in `isError` and `error` states
5. ✅ **Automatic Refetch**: Query refetches when parameters change
6. ✅ **No Manual Token Management**: Uses axios interceptor automatically
7. ✅ **Type Safety**: Full TypeScript support

## Common Patterns

### Pattern 1: Fetch on Button Click
```typescript
const [userId, setUserId] = useState<string | null>(null);
const { data } = useUser(userId || '', !!userId);

<button onClick={() => setUserId('123')}>
    Load User
</button>
```

### Pattern 2: Fetch on Modal Open
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedId, setSelectedId] = useState('');

const { data } = useDetails(selectedId, isModalOpen && !!selectedId);

const openModal = (id: string) => {
    setSelectedId(id);
    setIsModalOpen(true);
};
```

### Pattern 3: Multiple Dependent Queries
```typescript
const [step, setStep] = useState(1);
const [params, setParams] = useState({ id: '', date: '' });

// First query
const { data: step1Data } = useQuery1(params.id, step === 1);

// Second query (depends on first)
const { data: step2Data } = useQuery2(
    params.id,
    params.date,
    step === 2 && !!step1Data
);
```

## Troubleshooting

### Query Not Running?
Check:
1. Is `enabled` flag `true`?
2. Are all required parameters provided?
3. Check browser console for errors

### Query Running Too Often?
- Adjust `staleTime` to cache longer
- Use `enabled` flag to control when it runs

### Data Not Updating?
- Check if `queryKey` includes all parameters
- React Query uses `queryKey` to determine if query should refetch

## Summary

**Key Takeaway**: When you need to call a React Query hook with dynamic parameters:
1. Use state to hold the parameters
2. Call the hook at the top level
3. Use the `enabled` flag to control when it runs
4. Use `useEffect` to react to data changes
5. Update state to trigger the query

This pattern works for any React Query hook with dynamic parameters! 🎉

