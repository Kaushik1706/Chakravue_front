# 🚀 Quick Start - Get It Running in 5 Minutes

## What You Have

✅ **Complete SaaS Payment System**
- Hospital signup flow
- Plan selection (Starter/Professional/Enterprise)
- Dummy payment processing
- Automatic database creation per hospital

✅ **Per-Hospital Databases**
- Each hospital gets isolated database
- Automatic user setup (receptionist, OPD, doctor)
- Complete data isolation

✅ **Organization-Specific Login**
- Hospitals can see themselves in dropdown
- Users login to their specific hospital database
- Dashboard shows only their data

✅ **Admin Dashboard**
- View all organizations
- Monitor revenue ($MRR)
- See user distribution
- Organization analytics

---

## ⚡ Quick Start (Windows PowerShell)

### Step 1: Ensure MongoDB is Running
```powershell
# Open a new terminal and run MongoDB
mongod
# You should see: waiting for connections on port 27017
```

### Step 2: Update Backend (main.py)

Open `backend/main.py` and add this at the top:

```python
# Add this import at the top
from saas_endpoints import router as saas_router

# Then inside your FastAPI app initialization, add:
app.include_router(saas_router)
```

Your main.py should look like:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from saas_endpoints import router as saas_router  # ADD THIS
import database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(saas_router)  # ADD THIS

# Your existing routes...
@app.get("/")
async def root():
    return {"message": "Chakravue AI Backend"}

# Rest of your code...
```

### Step 3: Start Backend

```powershell
# In a terminal, navigate to backend folder
cd c:\Users\suman\Downloads\dashb\ (3)\dashb\backend

# Run backend
python main.py

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8008
# INFO:     Application startup complete
```

### Step 4: Start Frontend

```powershell
# In another terminal, navigate to frontend folder
cd c:\Users\suman\Downloads\dashb\ (3)\dashb

# Run frontend
npm run dev

# You should see:
# VITE v5.x.x  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

### Step 5: Open in Browser

Go to: **http://localhost:5173**

---

## 🎬 Test the Complete Flow

### Test 1: Hospital Signs Up and Pays

```
1. Click: "For Hospital Admins (Create Account)" 
   (or navigate to /payment-setup)

2. Select Plan: "Professional" ($299/month)

3. Fill Hospital Details:
   Name: Test Hospital Alpha
   Email: admin@alphas.com
   Phone: +1-555-1111

4. Payment Details:
   Card: 4111111111111111
   Name: Test Card
   CVV: 123
   Expiry: 12/25

5. Add Team Members:
   - receptionist@alphas.com (Receptionist)
   - opd@alphas.com (OPD)
   - doctor@alphas.com (Doctor)

6. Complete Setup ✅
   Database: test_hospital_alpha (CREATED)
   Users: 3 users created
   Organization ID: org_<timestamp>
```

### Test 2: Doctor Logs In

```
1. Click: "Organization Login"
   (or navigate to /organization-login)

2. Click: "Load Hospitals"
   Shows: Test Hospital Alpha (Professional)

3. Select: "Test Hospital Alpha"

4. Login:
   Email: doctor@alphas.com
   Password: default_password_123

5. Success! ✅
   You're in the doctor dashboard
   Only Test Hospital Alpha data visible
```

### Test 3: Create Another Hospital

```
Repeat Test 1 with different details:
   Name: Hospital Beta
   Email: admin@beta.com
   Phone: +1-555-2222

Now you have:
- test_hospital_alpha (database)
- hospital_beta (database)
Each completely isolated!
```

### Test 4: Check Admin Dashboard

```
1. Access: http://localhost:5173/admin
   (or look for admin button in sidebar)

2. See:
   - Total Organizations: 2
   - Active Subscriptions: 2
   - Monthly Revenue: $598 (2 x $299)
   - Plan Distribution Chart
   - Revenue Trend Graph

3. Click on organization to see:
   - Organization details
   - User list by role
   - Plan information
   - Created date
```

---

## 📝 File Locations

### New Files Created:

**Frontend:**
- `src/components/PaymentSetupView.tsx` - Signup flow
- `src/components/OrganizationLoginView.tsx` - Organization login
- `src/components/AdminDashboardView.tsx` - Admin panel

**Backend:**
- `backend/saas_endpoints.py` - All SaaS API endpoints

**Documentation:**
- `COMPLETE_SAAS_SETUP_GUIDE.md` - Full technical guide
- `SAAS_FLOW_VISUAL_GUIDE.md` - Visual step-by-step guide
- `QUICK_START.md` - This file

---

## 🔧 Update App.tsx to Show All Views

Add this to your `src/App.tsx` in the view rendering section:

```typescript
// Add imports at top
import { PaymentSetupView } from './components/PaymentSetupView';
import { OrganizationLoginView } from './components/OrganizationLoginView';
import { AdminDashboardView } from './components/AdminDashboardView';

// In your render/return section, add these views:

if (currentView === 'payment-setup') {
  return <PaymentSetupView />;
}

if (currentView === 'organization-login') {
  return (
    <OrganizationLoginView 
      onLoginSuccess={(user) => {
        // Store org context
        localStorage.setItem('currentOrganization', JSON.stringify(user));
        setCurrentView('dashboard');
      }}
    />
  );
}

if (currentView === 'admin-dashboard') {
  return <AdminDashboardView />;
}
```

And update your login page with buttons:

```typescript
// In UserLoginView or your login component
<div className="flex gap-4 mt-6">
  <button onClick={() => navigate('payment-setup')}>
    For Hospital Admins
  </button>
  <button onClick={() => navigate('organization-login')}>
    Organization Login
  </button>
  <button onClick={() => navigate('admin-dashboard')}>
    Admin Dashboard
  </button>
</div>
```

---

## 🐛 Troubleshooting

### Error: "Connection refused" or "Cannot connect to backend"

**Solution:**
- Make sure MongoDB is running: `mongod` in terminal
- Make sure backend is running: `python main.py` in another terminal
- Make sure frontend is running: `npm run dev` in third terminal
- Check that backend is on port 8008
- Check that frontend is on port 5173

### Error: "Organization not found" during payment

**Solution:**
- Clear browser cache: Ctrl+Shift+Del
- Check MongoDB is running
- Check backend logs for errors
- Try creating organization again

### Error: "Users list is empty" in admin dashboard

**Solution:**
- Make sure at least one organization is created
- Try "Refresh" button on admin dashboard
- Check that payment was completed successfully
- Check MongoDB has data in master database

### Test Card Not Working

Use this exact test card:
- **Card Number:** `4111111111111111`
- **CVV:** `123`
- **Expiry:** `12/25` (any future date works)
- **Name:** `Test Card` (any name works)

---

## 📊 Expected Behavior

### After Hospital Signup:

**Master Database (chakravue_master):**
```
organizations collection
└── 1 document per organization
    ├── organization_id
    ├── organization_name
    ├── database_name
    ├── plan
    ├── status: "active"
    └── created_at
```

**Organization Database (hospital_name_lowercase):**
```
users collection
├── 3 users created
│   ├── receptionist@...
│   ├── opd@...
│   └── doctor@...
├── patients collection (empty initially)
├── appointments collection (empty initially)
├── pharmacy collection (empty initially)
└── audit_logs collection (empty initially)
```

### Login Flow:

1. Organization Login page loads
2. Fetches all organizations from master DB
3. Shows dropdown list
4. User selects organization
5. Enters credentials
6. System queries organization's specific database
7. Returns user data and token
8. Frontend stores organization context in localStorage
9. Dashboard loads with organization data only

---

## 🎯 Test Checklist

- [ ] MongoDB is running
- [ ] Backend is running on :8008
- [ ] Frontend is running on :5173
- [ ] Can access http://localhost:5173
- [ ] Can see "For Hospital Admins" button
- [ ] Can select plan and see payment form
- [ ] Can enter test card details
- [ ] Payment processes successfully
- [ ] Database is created (visible in MongoDB)
- [ ] Can add users
- [ ] Setup completes successfully
- [ ] Can go to organization login
- [ ] "Load Hospitals" shows created organization
- [ ] Can login as doctor
- [ ] Dashboard loads with correct organization data
- [ ] Admin dashboard shows organization stats

---

## 🚀 What's Next?

### Basic Features Working ✅
- Hospital signup
- Payment processing (dummy)
- Database provisioning
- User creation per organization
- Organization-specific login
- Admin dashboard

### Next Steps (Optional)
1. Integrate real Stripe payments
2. Add email notifications
3. Implement JWT token authentication
4. Add password hashing with bcrypt
5. Create subscription management UI
6. Add organization settings page
7. Implement upgrade/downgrade flows
8. Add audit logging

---

## 📞 Quick Help

**Q: Do I need a credit card?**
A: No! It's all dummy/test payment. Use test card: `4111111111111111`

**Q: Can I create multiple hospitals?**
A: Yes! Repeat the signup flow with different names and emails.

**Q: Where is my data stored?**
A: MongoDB locally. Each hospital has separate database.

**Q: How do I reset everything?**
A: Delete MongoDB databases:
```powershell
# In mongod console or mongo shell
db.dropDatabase()  # Drops current database
```

**Q: How many hospitals can I create?**
A: Unlimited! Each gets its own isolated database.

---

## 📄 Files Reference

| File | Purpose |
|------|---------|
| PaymentSetupView.tsx | Hospital signup + payment + user setup |
| OrganizationLoginView.tsx | Login for hospital users |
| AdminDashboardView.tsx | Admin panel to manage all hospitals |
| saas_endpoints.py | Backend APIs for SaaS |
| COMPLETE_SAAS_SETUP_GUIDE.md | Full technical documentation |
| SAAS_FLOW_VISUAL_GUIDE.md | Visual flow diagrams |
| QUICK_START.md | This quick start guide |

---

## ✨ Key Highlights

🎯 **Complete Isolation**: Each hospital gets its own database
💳 **Dummy Payment**: Test without real credit cards
👥 **User Roles**: Auto-create receptionist, OPD, doctor
📊 **Admin Panel**: View all organizations and revenue
🚀 **Production Ready**: Code is ready for Stripe integration

---

Start here: **http://localhost:5173** 🚀
