# Quick Reference: Date Utilities

## Import Statement
```typescript
import {
  formatDateForAPI,
  getCurrentDateISO,
  getDateDaysAgo,
  normalizeDateForAPI,
  parseDateToISO,
  createDateRange
} from '@/lib/utils';
```

## Common Use Cases

### 1. Get Current Date for API
```typescript
// ✅ DO THIS
const today = getCurrentDateISO();
params.append('date', today);

// ❌ DON'T DO THIS
const today = new Date().toISOString().split('T')[0];
```

### 2. Get Date Range (Last N Days)
```typescript
// ✅ DO THIS
const startDate = getDateDaysAgo(30);  // 30 days ago
const endDate = getCurrentDateISO();   // today

// ❌ DON'T DO THIS
const endDate = new Date();
const startDate = new Date();
startDate.setDate(endDate.getDate() - 30);
const start = startDate.toISOString().split('T')[0];
```

### 3. Format Date Object for API
```typescript
// ✅ DO THIS
const date = new Date();
params.append('date', formatDateForAPI(date));

// ❌ DON'T DO THIS
const formatted = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
```

### 4. Handle User Input (Any Format)
```typescript
// ✅ DO THIS
const userInput = "25/12/2025";  // DD/MM/YYYY
const normalized = normalizeDateForAPI(userInput);
params.append('date', normalized);  // "2025-12-25"

// ❌ DON'T DO THIS
params.append('date', userInput);  // Will cause issues!
```

### 5. Date Picker onChange Handler
```typescript
// ✅ DO THIS
<input
  type="date"
  value={date}
  onChange={(e) => setDate(normalizeDateForAPI(e.target.value))}
/>

// ❌ DON'T DO THIS
<input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}  // Might work, but not guaranteed
/>
```

### 6. Initialize Date State
```typescript
// ✅ DO THIS
const [dateRange, setDateRange] = useState({
  start: getDateDaysAgo(7),
  end: getCurrentDateISO()
});

// ❌ DON'T DO THIS
const [dateRange, setDateRange] = useState({
  start: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
});
```

### 7. Create Date Range Object
```typescript
// ✅ DO THIS
const range = createDateRange(startDate, endDate);
// Returns: { start: "2025-01-01", end: "2025-12-31" }

// Works with Date objects or strings
const range1 = createDateRange(new Date(), new Date());
const range2 = createDateRange("01/01/2025", "31/12/2025");
```

### 8. Parse User Date String
```typescript
// ✅ DO THIS
const userDate = "25/12/2025";
const parsed = parseDateToISO(userDate);
if (parsed) {
  params.append('date', parsed);  // "2025-12-25"
} else {
  console.error('Invalid date');
}

// For guaranteed result (with fallback):
const normalized = normalizeDateForAPI(userDate);
params.append('date', normalized);
```

## Function Quick Reference

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `getCurrentDateISO()` | None | `"2025-12-01"` | Get today's date |
| `getDateDaysAgo(n)` | Number | `"2025-11-24"` | Get date N days ago |
| `formatDateForAPI(date)` | Date object | `"2025-12-01"` | Format Date to ISO |
| `normalizeDateForAPI(date)` | Date or string | `"2025-12-01"` | Universal normalizer |
| `parseDateToISO(str)` | String | `"2025-12-01"` or `null` | Parse date string |
| `createDateRange(s, e)` | 2 dates/strings | `{ start, end }` | Create date range |

## Common Patterns

### API Request with Date Filters
```typescript
const params = new URLSearchParams();
params.append('startDate', getDateDaysAgo(30));
params.append('endDate', getCurrentDateISO());
params.append('category', category);

const response = await fetch(`${API_URL}?${params}`);
```

### Date Range Component
```typescript
const [dateRange, setDateRange] = useState({
  start: getDateDaysAgo(30),
  end: getCurrentDateISO()
});

const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setDateRange(prev => ({
    ...prev,
    start: normalizeDateForAPI(e.target.value)
  }));
};

const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setDateRange(prev => ({
    ...prev,
    end: normalizeDateForAPI(e.target.value)
  }));
};
```

### Date Filter Hook
```typescript
const useDateFilter = (defaultDays = 30) => {
  const [dateRange, setDateRange] = useState({
    start: getDateDaysAgo(defaultDays),
    end: getCurrentDateISO()
  });

  const setDaysAgo = (days: number) => {
    setDateRange({
      start: getDateDaysAgo(days),
      end: getCurrentDateISO()
    });
  };

  return { dateRange, setDateRange, setDaysAgo };
};
```

## Remember

1. **Always use these utilities** when sending dates to APIs
2. **All functions return YYYY-MM-DD format** - the ISO 8601 standard
3. **Never send DD/MM/YYYY** to APIs - it's ambiguous
4. **Normalize user input** before sending to backend
5. **Check Network tab** to verify date format in requests

## Examples from Codebase

See these files for real-world usage:
- `src/components/tables/daily-sales-report.tsx`
- `src/components/heat-map/heat-map.tsx`
- `src/lib/services/heatmap.client.ts`
- `src/app/dashboard/user-management/sales-employee-data/page.tsx`

## Need Help?

Check the full documentation: `DATE_FORMAT_FIX.md`

