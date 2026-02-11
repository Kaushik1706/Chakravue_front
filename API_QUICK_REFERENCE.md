# Quick Reference: API Configuration

## Current Setup ✅

```
.env
├─ VITE_API_BASE_URL=http://localhost:8008

src/config/api.ts
├─ Exports: API_ENDPOINTS object
├─ Contains all 50+ endpoint definitions
└─ Reads VITE_API_BASE_URL at runtime
```

## Usage in Components

```typescript
import API_ENDPOINTS from '../config/api';

// Static endpoints
fetch(API_ENDPOINTS.PATIENTS_NEW)
fetch(API_ENDPOINTS.QUEUE_RECEPTION)

// Dynamic endpoints (with parameters)
fetch(API_ENDPOINTS.PATIENT(registrationId))
fetch(API_ENDPOINTS.BILLING_SUMMARY(regId))
fetch(API_ENDPOINTS.PATIENT_DOCUMENT_DOWNLOAD(regId, docId, inline))
```

## Deployment Checklist

- [ ] Update `.env` with your backend URL
- [ ] Run `npm run dev` to test locally
- [ ] Run `npm run build` for production
- [ ] Deploy the `build/` folder

## Environment URLs

```
Development:  http://localhost:8008
Staging:      https://staging-api.yourdomain.com
Production:   https://api.yourdomain.com
```

## Component Updates

All 10 components updated:
- ✅ App.tsx
- ✅ EditableText.tsx
- ✅ AnalyticsView.tsx
- ✅ BillingView.tsx
- ✅ UserLoginView.tsx
- ✅ ReceptionQueueView.tsx
- ✅ PatientHistoryView.tsx
- ✅ OpdQueueView.tsx
- ✅ DocumentsView.tsx
- ✅ DoctorQueueView.tsx

## Total URLs Replaced: 47 ✅

No more hardcoded URLs! All centralized in `src/config/api.ts`
