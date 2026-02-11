# Complete SaaS Implementation Guide - Step by Step

## 🎯 Overview

This guide shows how organizations sign up, pay, and get their own isolated database with receptionist, doctor, and OPD users.

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Structure](#database-structure)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Testing the Flow](#testing-the-flow)
6. [Adding Users to Organization](#adding-users-to-organization)
7. [Deployment Instructions](#deployment-instructions)

---

## 🏗️ System Architecture

### Master Database (MongoDB)
- Stores all organizations
- Stores payments and subscriptions
- Central source of truth for SaaS
- Name: `chakravue_master`

### Per-Organization Database (MongoDB)
- Each hospital gets their own database
- Name: `hospital_name_lowercase` (e.g., `st_marys_hospital`)
- Isolated data - no cross-organization access
- Contains: users, patients, appointments, pharmacy, etc.

### Flow Diagram
```
1. Organization Signup Page
   ↓
2. Select Plan (Starter/Professional/Enterprise)
   ↓
3. Organization Details (Name, Email, Phone)
   ↓
4. Payment Processing (Dummy/Stripe)
   ↓
5. Database Creation (MongoDB)
   ↓
6. User Setup (Add Receptionist, Doctor, OPD)
   ↓
7. Login and Use Dashboard
```

---

## 🗄️ Database Structure

### Master Database: `chakravue_master`

#### Organizations Collection
```javascript
{
  organization_id: "org_1702000000000",
  organization_name: "St. Mary's Hospital",
  organization_email: "admin@stmarys.com",
  organization_phone: "+1-555-0000",
  database_name: "st_marys_hospital",
  plan: "professional",
  plan_name: "Professional",
  plan_price: 299,
  max_users: 20,
  status: "active",  // pending_payment, active, suspended
  created_at: "2024-12-15T10:30:00",
  payment_date: "2024-12-15T11:00:00",
  subscription_id: "sub_1702000000"
}
```

### Organization Database: `st_marys_hospital`

#### Users Collection
```javascript
{
  user_id: "user_1702000000000",
  email: "dr.smith@stmarys.com",
  role: "DOCTOR",  // RECEPTIONIST, OPD, DOCTOR
  password: "hashed_password",  // Should be hashed with bcrypt!
  organization_id: "org_1702000000000",
  status: "active",
  created_at: "2024-12-15T11:30:00",
  last_login: "2024-12-15T14:00:00"
}
```

#### Patients Collection
```javascript
{
  patient_id: "PAT001",
  name: "John Doe",
  email: "john@email.com",
  phone: "+1-555-1234",
  age: 45,
  gender: "M",
  registrationDate: "2024-12-15",
  organization_id: "org_1702000000000"
}
```

#### Other Collections
- `appointments`
- `pharmacy`
- `settings`
- `audit_logs`

---

## 🎨 Frontend Setup

### Step 1: Import Components in App.tsx

```typescript
import { PaymentSetupView } from './components/PaymentSetupView';
import { OrganizationLoginView } from './components/OrganizationLoginView';
import { AdminDashboardView } from './components/AdminDashboardView';

// Add this to your view routing
if (currentView === 'payment-setup') {
  return <PaymentSetupView />;
}

if (currentView === 'organization-login') {
  return <OrganizationLoginView onLoginSuccess={handleOrgLogin} />;
}

if (currentView === 'admin-dashboard') {
  return <AdminDashboardView />;
}
```

### Step 2: Update Login Page

Add a button to the login page that says "For Hospital Admins" that navigates to organization payment setup.

```typescript
<button 
  onClick={() => setCurrentView('payment-setup')}
  className="border border-[#D4A574] text-[#D4A574] px-6 py-2 rounded"
>
  For Hospital Admins (Create Account)
</button>
```

### Step 3: Components Included

1. **PaymentSetupView.tsx** - Complete signup flow
2. **OrganizationLoginView.tsx** - Organization-specific login
3. **AdminDashboardView.tsx** - Admin panel to manage organizations

---

## ⚙️ Backend Setup

### Step 1: Install Dependencies

```bash
pip install fastapi pymongo pydantic python-dateutil
```

### Step 2: Add saas_endpoints.py to Backend

The file `saas_endpoints.py` contains all API endpoints for:
- Organization signup
- Payment processing (dummy)
- Database creation
- User management
- Organization login

### Step 3: Register Routes in main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from saas_endpoints import router as saas_router

app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include SaaS routes
app.include_router(saas_router)

# Your existing routes...
@app.get("/")
async def root():
    return {"message": "Chakravue AI Backend"}
```

### Step 4: API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/signup` | POST | Register new organization |
| `/process-payment` | POST | Process payment and create database |
| `/add-user` | POST | Add user to organization database |
| `/organization/{org_id}` | GET | Get organization details |
| `/organization/{org_id}/users` | GET | List organization users |
| `/organization-login` | POST | Login to organization |
| `/master/all-organizations` | GET | Get all organizations (admin) |
| `/health` | GET | Health check |

### Step 5: Request/Response Examples

#### Signup Request
```json
{
  "organization_name": "St. Mary's Hospital",
  "organization_email": "admin@stmarys.com",
  "organization_phone": "+1-555-0000",
  "plan": {
    "plan_id": "professional",
    "name": "Professional",
    "price": 299,
    "max_users": 20
  }
}
```

#### Add User Request
```json
{
  "organization_id": "org_1702000000000",
  "email": "dr.smith@stmarys.com",
  "role": "doctor",
  "password": "default_password_123"
}
```

#### Organization Login Request
```json
{
  "email": "dr.smith@stmarys.com",
  "password": "default_password_123",
  "organization_id": "org_1702000000000"
}
```

---

## 🧪 Testing the Flow

### Test Scenario: New Hospital Signs Up

#### Step 1: Payment Setup
1. Go to Payment Setup page
2. Select "Professional" plan ($299/month)
3. Enter hospital details:
   - Name: "Test Hospital"
   - Email: "admin@testhospital.com"
   - Phone: "+1-555-9999"

#### Step 2: Payment
1. Use test card: `4111 1111 1111 1111`
2. CVV: `123`
3. Expiry: `12/25`
4. System will create database: `test_hospital`
5. Organization ID: `org_1702000000000`

#### Step 3: Add Users
1. Add Receptionist: `receptionist@testhospital.com`
2. Add OPD: `opd@testhospital.com`
3. Add Doctor: `doctor@testhospital.com`
4. Complete setup

#### Step 4: Login
1. Go to Organization Login page
2. Load hospitals (fetches from master DB)
3. Select "Test Hospital"
4. Login with: `doctor@testhospital.com` / `default_password_123`
5. Dashboard loads with organization context

---

## 👥 Adding Users to Organization

### Method 1: During Setup (UI)
- Done in PaymentSetupView after payment
- Users added to organization database

### Method 2: Admin Panel (After Setup)
```python
# Call this endpoint
POST /add-user
{
  "organization_id": "org_1702000000000",
  "email": "newdoctor@hospital.com",
  "role": "doctor",
  "password": "new_password_123"
}
```

### Method 3: From Admin Dashboard
- Go to Admin Dashboard
- Select organization
- See all users
- Add new users via form

### User Roles Available
- **RECEPTIONIST** - Manage appointments, pharmacy
- **OPD** - Outpatient department staff
- **DOCTOR** - Doctor with full dashboard access

---

## 📦 Files Created

1. **Frontend Components:**
   - `src/components/PaymentSetupView.tsx` - Complete signup flow
   - `src/components/OrganizationLoginView.tsx` - Organization login
   - `src/components/AdminDashboardView.tsx` - Admin panel

2. **Backend:**
   - `backend/saas_endpoints.py` - All SaaS API endpoints

---

## 🚀 Deployment Instructions

### Local Testing

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend**
   ```bash
   cd backend
   python main.py
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```

4. **Access URLs**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8008

### Production Deployment

1. **MongoDB Atlas Setup**
   - Create cluster at mongodb.com/cloud
   - Create master database
   - Get connection string
   - Update backend to use Atlas connection

2. **Backend Deployment (Heroku/Railway)**
   ```bash
   # Deploy with connection string environment variable
   MONGODB_URI=<your_atlas_connection_string>
   ```

3. **Frontend Deployment (Vercel/Netlify)**
   ```bash
   npm run build
   # Deploy build folder
   ```

4. **Environment Variables**
   - Backend: `MONGODB_URI`, `STRIPE_API_KEY` (if using real Stripe)
   - Frontend: `VITE_API_URL` pointing to production backend

---

## 🔒 Security Considerations

### Current Implementation (Testing)
- ✅ Organization isolation via database per org
- ✅ Basic authentication with email/password
- ⚠️ Passwords stored as plaintext (testing only)

### For Production

1. **Hash Passwords**
   ```python
   from werkzeug.security import generate_password_hash, check_password_hash
   
   # When creating user
   hashed_password = generate_password_hash(password)
   
   # When logging in
   check_password_hash(stored_hash, provided_password)
   ```

2. **Implement JWT Tokens**
   ```python
   import jwt
   from datetime import datetime, timedelta
   
   token = jwt.encode({
       'user_id': user_id,
       'organization_id': org_id,
       'exp': datetime.utcnow() + timedelta(hours=24)
   }, SECRET_KEY, algorithm='HS256')
   ```

3. **HTTPS Only**
   - Use HTTPS in production
   - Set Secure cookies

4. **Rate Limiting**
   - Limit signup and payment endpoints
   - Prevent brute force attacks

5. **Data Encryption**
   - Encrypt sensitive data at rest
   - Use TLS for data in transit

---

## 📊 Pricing Plans

| Plan | Price | Users | Storage | Features |
|------|-------|-------|---------|----------|
| Starter | $99/mo | 5 | 1GB | Basic Reports, Email Support |
| Professional | $299/mo | 20 | 10GB | Advanced Analytics, Priority Support |
| Enterprise | $999/mo | Unlimited | 100GB | Custom Analytics, 24/7 Support |

---

## 🎯 Next Steps

1. **Integration with Stripe** (Optional)
   - Replace dummy payment with real Stripe
   - Add webhook handling for subscription events

2. **Email Notifications**
   - Welcome email to organization
   - Password reset flow
   - Subscription reminders

3. **Advanced Features**
   - Custom branding per organization
   - User role management UI
   - Subscription management page

4. **Analytics**
   - Track organization usage
   - Monitor database performance
   - Generate revenue reports

---

## ❓ FAQ

**Q: Can organizations access other organizations' data?**
A: No. Each organization has isolated database with no cross-organization queries.

**Q: How do I backup organization databases?**
A: Use MongoDB backup features. With Atlas, automatic daily backups are included.

**Q: What happens if payment fails?**
A: Organization status becomes "pending_payment". Users cannot login until payment succeeds.

**Q: Can I change plans?**
A: Yes (to be implemented). Update plan in master database and adjust max_users limit.

**Q: How do I handle refunds?**
A: Stripe handles refunds. Update organization status to "canceled" after refund.

---

## 📞 Support

For issues or questions, check:
1. Backend logs for API errors
2. MongoDB for data integrity
3. Browser console for frontend errors
