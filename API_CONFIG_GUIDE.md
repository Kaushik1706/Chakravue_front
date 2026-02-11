# API Configuration Guide

## Overview
All API endpoints are now centralized in `src/config/api.ts` and use environment variables for easy deployment across different environments.

## Environment Variables

The API base URL is controlled by the `VITE_API_BASE_URL` environment variable in the `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8008
```

## File Structure

- **`.env`** - Your local environment configuration (not committed to git)
- **`.env.example`** - Template showing available variables and examples
- **`src/config/api.ts`** - Central API endpoint configuration

## Using the API Configuration

All components import from the centralized config:

```typescript
import API_ENDPOINTS from '../config/api';

// Usage in components:
fetch(API_ENDPOINTS.PATIENTS_NEW, { method: 'POST', ... })
fetch(API_ENDPOINTS.PATIENT(registrationId))
fetch(API_ENDPOINTS.QUEUE_RECEPTION)
// ... etc
```

## Deployment Guide

### Development
```env
VITE_API_BASE_URL=http://localhost:8008
```

### Staging
```env
VITE_API_BASE_URL=https://staging-api.yourdomain.com
```

### Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Available Endpoints

The `API_ENDPOINTS` object includes:

### Auth
- `AUTH_LOGIN` - User login
- `USERS_NEW` - Create new user

### Patients
- `PATIENTS_NEW` - Create new patient
- `PATIENTS_ALL` - Get all patients
- `PATIENTS_SEARCH` - Search patients
- `PATIENT(regId)` - Get specific patient
- `PATIENT_VISITS(regId)` - Get patient visits
- `PATIENT_DOCUMENTS(regId)` - Get patient documents
- `PATIENT_DOCUMENT_DOWNLOAD(regId, docId, inline)` - Download document

### Queues
- `QUEUE_RECEPTION` - Reception queue
- `QUEUE_RECEPTION_ITEM(queueId)` - Specific reception queue item
- `QUEUE_OPD` - OPD queue
- `QUEUE_OPD_ITEM(queueId)` - Specific OPD queue item
- `QUEUE_DOCTOR` - Doctor queue
- `QUEUE_DOCTOR_ITEM(queueId)` - Specific doctor queue item
- `QUEUE_RECALL_TO_RECEPTION` - Recall to reception
- `QUEUE_RECALL_TO_OPD` - Recall to OPD

### Appointments
- `APPOINTMENTS` - Get appointments
- `APPOINTMENT(appointmentId)` - Specific appointment

### Analytics
- `ANALYTICS_IOP_TREND(regId)` - IOP trend data
- `ANALYTICS_VISUAL_ACUITY(regId)` - Visual acuity data
- `ANALYTICS_VISITS(regId)` - Visit statistics
- `ANALYTICS_IOP_DISTRIBUTION(regId)` - IOP distribution
- `ANALYTICS_PROCEDURES(regId)` - Procedures data

### Billing
- `BILLING_SUMMARY(regId)` - Billing summary
- `BILLING_INSURANCE(regId)` - Insurance information
- `BILLING_INVOICES(regId)` - Invoices
- `BILLING_PAYMENTS(regId)` - Payments
- `BILLING_CLAIMS(regId)` - Claims

### Evaluation
- `EVALUATE_READING` - Evaluate reading values

## Files Modified

All these files now use the centralized `API_ENDPOINTS` configuration:

- `src/App.tsx`
- `src/components/EditableText.tsx`
- `src/components/AnalyticsView.tsx`
- `src/components/BillingView.tsx`
- `src/components/UserLoginView.tsx`
- `src/components/ReceptionQueueView.tsx`
- `src/components/PatientHistoryView.tsx`
- `src/components/OpdQueueView.tsx`
- `src/components/DocumentsView.tsx`
- `src/components/DoctorQueueView.tsx`

## Adding New Endpoints

To add a new endpoint:

1. Open `src/config/api.ts`
2. Add the endpoint to the `API_ENDPOINTS` object following the existing pattern
3. Import and use in your component

Example:
```typescript
// In src/config/api.ts
NEW_ENDPOINT: `${API_BASE_URL}/new-path`,
NEW_ENDPOINT_WITH_PARAM: (id: string) => `${API_BASE_URL}/new-path/${encodeURIComponent(id)}`,

// In your component
import API_ENDPOINTS from '../config/api';
fetch(API_ENDPOINTS.NEW_ENDPOINT)
```
