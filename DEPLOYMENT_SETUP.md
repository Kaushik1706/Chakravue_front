# Backend API URL Centralization - Complete Summary

## What Was Done

✅ **Created Centralized API Configuration**
- New file: `src/config/api.ts` - Contains all API endpoints
- Uses environment variable: `VITE_API_BASE_URL`

✅ **Environment Configuration**
- Created `.env` file with `VITE_API_BASE_URL=http://localhost:8008`
- Created `.env.example` for documentation

✅ **Updated All Components**
Replaced all hardcoded `http://localhost:8008` URLs with `API_ENDPOINTS` imports in:
1. `src/App.tsx` - 14 URL replacements
2. `src/components/EditableText.tsx` - 1 URL replacement
3. `src/components/AnalyticsView.tsx` - 5 URL replacements
4. `src/components/BillingView.tsx` - 7 URL replacements
5. `src/components/UserLoginView.tsx` - 2 URL replacements
6. `src/components/ReceptionQueueView.tsx` - 3 URL replacements
7. `src/components/PatientHistoryView.tsx` - 3 URL replacements
8. `src/components/OpdQueueView.tsx` - 3 URL replacements
9. `src/components/DocumentsView.tsx` - 6 URL replacements
10. `src/components/DoctorQueueView.tsx` - 3 URL replacements

**Total: 47 hardcoded URLs replaced with centralized configuration**

## How to Deploy

### For Local Development (Default)
No changes needed - `.env` already has `VITE_API_BASE_URL=http://localhost:8008`

### For Staging
1. Update `.env` file:
```env
VITE_API_BASE_URL=https://staging-api.yourdomain.com
```
2. Run `npm run dev` or `npm run build`

### For Production
1. Update `.env` file:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```
2. Run `npm run build`
3. Deploy the build folder

## Key Benefits

✅ **Easy Deployment** - Change one environment variable for different environments
✅ **Centralized Management** - All endpoints in one file for easy updates
✅ **Type Safety** - Function-based endpoints ensure proper parameter passing
✅ **Consistency** - All components use the same API configuration
✅ **Maintainability** - Adding new endpoints is simple and documented

## Files Created

1. **`src/config/api.ts`** - Central API endpoint configuration
2. **`.env`** - Environment variables (development)
3. **`.env.example`** - Template for environment variables
4. **`API_CONFIG_GUIDE.md`** - Comprehensive guide

## Next Steps

1. Test locally with `npm run dev`
2. Before deploying to staging/production, update the `.env` file with your server URL
3. Run `npm run build` to create production bundle
4. Deploy!

## No More Hardcoded URLs!

All API calls now use the centralized configuration:

**Before:**
```typescript
fetch('http://localhost:8008/patients/new', { ... })
fetch('http://localhost:8008/api/billing/patient/REG-123/summary', { ... })
```

**After:**
```typescript
fetch(API_ENDPOINTS.PATIENTS_NEW, { ... })
fetch(API_ENDPOINTS.BILLING_SUMMARY(registrationId), { ... })
```
