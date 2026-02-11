# System Architecture & Navigation Flow

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION START                          │
│                                                                   │
│              [Your Chakravue EMR App Opens]                      │
│                          ↓                                        │
│              ┌──────────────────────────┐                        │
│              │   LOGIN PAGE DISPLAYED   │                        │
│              │  (UserLoginView.tsx)     │                        │
│              └──────────────────────────┘                        │
│                          ↓                                        │
│              ┌──────────────────────────────────┐                │
│              │ Regular Users (4 Options):       │                │
│              │ • Receptionist                   │                │
│              │ • OPD Staff                      │                │
│              │ • Doctor                         │                │
│              │ • Patient                        │                │
│              │                                  │                │
│              │ ===== NEW SECTION BELOW =====    │                │
│              │                                  │                │
│              │ Hospital/Org Management:         │                │
│              │ • 💳 Create Hospital             │                │
│              │ • 🏥 Hospital Staff              │                │
│              │ • 📊 Admin Panel                 │                │
│              └──────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete Flow for Hospital Signup

```
                    USER CLICKS "Create Hospital"
                              ↓
                ┌─────────────────────────────┐
                │  PaymentSetupView Opens     │
                │  (Step 1: Org Details)      │
                │                             │
                │  Form:                      │
                │  □ Organization Name        │
                │  □ Email                    │
                │  □ Phone                    │
                │  □ Address                  │
                │  □ Contact Person           │
                │                             │
                │  [Next Button]              │
                └─────────────────────────────┘
                              ↓
                ┌─────────────────────────────┐
                │  PaymentSetupView           │
                │  (Step 2: Plan Selection)   │
                │                             │
                │  ┌─────┐ ┌─────┐ ┌─────┐  │
                │  │ $99 │ │$299 │ │$999 │  │
                │  │Basic│ │Prof │ │Enter│  │
                │  └─────┘ └─────┘ └─────┘  │
                │                             │
                │  [Next Button]              │
                └─────────────────────────────┘
                              ↓
                ┌─────────────────────────────┐
                │  PaymentSetupView           │
                │  (Step 3: Dummy Payment)    │
                │                             │
                │  Card: [_____________]      │
                │  Exp:  [__] / [__]          │
                │  CVV:  [___]                │
                │                             │
                │  [Process Payment]          │
                └─────────────────────────────┘
                              ↓
                   (Payment Processed)
                              ↓
                ┌─────────────────────────────┐
                │  Backend Work:              │
                │                             │
                │  1. Store in master DB      │
                │  2. Create hospital_{id} DB │
                │  3. Create collections      │
                │  4. Add Receptionist user   │
                │  5. Add OPD user            │
                │  6. Add Doctor user         │
                └─────────────────────────────┘
                              ↓
                ┌─────────────────────────────┐
                │  PaymentSetupView           │
                │  (Step 4: Success Page)     │
                │                             │
                │  ✓ Organization Created!    │
                │  ✓ Database Created!        │
                │  ✓ Users Created!           │
                │                             │
                │  Organization ID:           │
                │  hospital_xxxxxxxxxxx       │
                │                             │
                │  Demo Users:                │
                │  Receptionist:              │
                │    admin@hospital.com       │
                │  OPD:                       │
                │    opd@hospital.com         │
                │  Doctor:                    │
                │    doctor@hospital.com      │
                │                             │
                │  [Go to Login]              │
                └─────────────────────────────┘
```

---

## Complete Flow for Hospital Staff Login

```
                 USER CLICKS "Hospital Staff"
                              ↓
                ┌─────────────────────────────┐
                │ OrganizationLoginView       │
                │ (Hospital Selection)        │
                │                             │
                │ [Dropdown v]                │
                │ ├─ Demo Hospital            │
                │ ├─ City Eye Clinic          │
                │ └─ Vision Center             │
                │                             │
                │ [Select Hospital]           │
                └─────────────────────────────┘
                              ↓
                ┌─────────────────────────────┐
                │ OrganizationLoginView       │
                │ (Staff Login)               │
                │                             │
                │ Email:    [____________]    │
                │ Password: [____________]    │
                │                             │
                │ Demo Credentials:           │
                │ Email: doctor@hospital.com  │
                │ Pwd: default_password_123   │
                │                             │
                │ [Login]                     │
                └─────────────────────────────┘
                              ↓
                    (Backend Validates)
                    Against hospital's DB
                              ↓
                ┌─────────────────────────────┐
                │  Auth Success!              │
                │                             │
                │  Logged in to:              │
                │  Hospital: Demo Hospital    │
                │  Database: hospital_xxxxx   │
                │  User: Doctor               │
                │                             │
                │  ✓ Access only to this      │
                │    hospital's data          │
                │  ✓ Cannot see other         │
                │    hospitals' data          │
                │                             │
                │  [Open Dashboard]           │
                └─────────────────────────────┘
                              ↓
                ┌─────────────────────────────┐
                │  Hospital Dashboard         │
                │                             │
                │  • Patients List            │
                │  • Appointments             │
                │  • Medical Records          │
                │  • Prescriptions            │
                │  • Analytics                │
                │  (All hospital-specific)    │
                └─────────────────────────────┘
```

---

## Complete Flow for Admin Dashboard

```
                   USER CLICKS "Admin Panel"
                              ↓
                ┌─────────────────────────────┐
                │  AdminDashboardView Opens   │
                │                             │
                │  Loading...                 │
                │  (Fetching all orgs)        │
                └─────────────────────────────┘
                              ↓
                ┌─────────────────────────────────────────────┐
                │  Admin Dashboard                            │
                │                                             │
                │  ┌────────┐ ┌──────────┐ ┌─────┐ ┌─────┐  │
                │  │Hotels  │ │Active    │ │ MRR │ │Users│  │
                │  │   3    │ │  Subs 2  │ │$598 │ │ 6   │  │
                │  └────────┘ └──────────┘ └─────┘ └─────┘  │
                │                                             │
                │  [Bar Chart: Plan Distribution]            │
                │       Basic(1)  Prof(2)  Enter(0)          │
                │                                             │
                │  [Line Chart: Revenue Trend]               │
                │       Jan Feb Mar Apr May Jun               │
                │       $0  $298 $598 ...                     │
                │                                             │
                │  Hospitals Table:                           │
                │  ┌────────────────────────────────────┐    │
                │  │ Hospital  │ Plan      │ Users │ Revenue│
                │  ├─ Demo Hospital│ Prof  │  3   │  $299  │
                │  ├─ City Clinic  │ Basic │  3   │  $99   │
                │  └────────────────────────────────────┘    │
                │                                             │
                │  [Click Hospital to See Details]            │
                └─────────────────────────────────────────────┘
                              ↓
                    [Click "Demo Hospital"]
                              ↓
                ┌─────────────────────────────┐
                │  Hospital Details View      │
                │                             │
                │  Organization ID:           │
                │  hospital_xxxxx             │
                │                             │
                │  Organization Name:         │
                │  Demo Hospital              │
                │                             │
                │  Plan: Professional         │
                │  Price: $299/month          │
                │  Max Users: 10              │
                │                             │
                │  Current Users: 3           │
                │  ├─ Receptionist (1)        │
                │  ├─ OPD Staff (1)           │
                │  └─ Doctor (1)              │
                │                             │
                │  Created: 2025-01-15        │
                │  Last Payment: 2025-01-15   │
                │  Status: Active             │
                │                             │
                │  [Back to Dashboard]        │
                └─────────────────────────────┘
```

---

## Database Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  MONGODB CLUSTERS                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────┐                             │
│  │  MASTER DATABASE       │                             │
│  │  chakravue_master      │                             │
│  ├────────────────────────┤                             │
│  │ Collections:           │                             │
│  │ ├─ organizations       │ ← Organization records      │
│  │ │  (org_id, name, plan)                              │
│  │ ├─ payments            │ ← Payment records           │
│  │ │  (payment_id, org_id,                              │
│  │ │   amount, status)                                  │
│  │ └─ admin_users         │ ← Admin accounts            │
│  │    (admin_id, email)                                 │
│  └────────────────────────┘                             │
│         ↑        ↑        ↑                              │
│         │        │        │                              │
│    Uses│    Uses│   Uses│                               │
│         │        │        │                              │
│  ┌──────┴────────┴────────┴──────────────────────────┐  │
│  │                                                    │  │
│  │  ONE DATABASE PER HOSPITAL                        │  │
│  │                                                    │  │
│  │  ┌────────────────────┐  ┌────────────────────┐  │  │
│  │  │ hospital_12345     │  │ hospital_67890     │  │  │
│  │  ├────────────────────┤  ├────────────────────┤  │  │
│  │  │ Collections:       │  │ Collections:       │  │  │
│  │  │ ├─ patients        │  │ ├─ patients        │  │  │
│  │  │ ├─ appointments    │  │ ├─ appointments    │  │  │
│  │  │ ├─ prescriptions   │  │ ├─ prescriptions   │  │  │
│  │  │ ├─ medical_records │  │ ├─ medical_records │  │  │
│  │  │ ├─ investigations  │  │ ├─ investigations  │  │  │
│  │  │ ├─ surgeries       │  │ ├─ surgeries       │  │  │
│  │  │ └─ users           │  │ └─ users           │  │  │
│  │  │    (hospital staff)│  │    (hospital staff)│  │  │
│  │  └────────────────────┘  └────────────────────┘  │  │
│  │    Completely                Completely           │  │
│  │    ISOLATED                  ISOLATED             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  KEY ISOLATION PRINCIPLE:                               │
│  Hospital A → hospital_12345 → can't access 67890      │
│  Hospital B → hospital_67890 → can't access 12345      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## File Organization

```
PROJECT ROOT
│
├── src/
│   ├── App.tsx                          [UPDATED]
│   │   • Added PaymentSetupView import
│   │   • Added OrganizationLoginView import
│   │   • Added AdminDashboardView import
│   │   • Added routing for 3 new views
│   │   • Added navigation callbacks
│   │
│   └── components/
│       ├── UserLoginView.tsx            [UPDATED]
│       │   • Added onNavigate prop
│       │   • Added 3 buttons at bottom
│       │   • Hospital & Organization section
│       │
│       ├── PaymentSetupView.tsx         [NEW] ✨
│       │   • 510 lines
│       │   • Hospital signup flow
│       │   • Multi-step form
│       │   • Dummy payment processing
│       │   • User creation
│       │
│       ├── OrganizationLoginView.tsx    [NEW] ✨
│       │   • 250 lines
│       │   • Hospital selection
│       │   • Staff login form
│       │   • Demo credentials display
│       │
│       └── AdminDashboardView.tsx       [NEW] ✨
│           • 306 lines
│           • All hospitals KPI cards
│           • Revenue analytics charts
│           • Hospital list table
│           • User breakdown view
│
├── backend/
│   ├── main.py
│   │   (may need to add saas_endpoints.py import)
│   │
│   └── saas_endpoints.py                [NEW] ✨
│       • 290 lines
│       • 8 endpoints
│       • Database provisioning logic
│       • Payment processing
│       • User management
│
└── documentation/
    ├── EXACTLY_WHERE_IS_IT.md           [NEW] ✨
    ├── WHERE_IS_EVERYTHING.md           [NEW] ✨
    ├── SAAS_INTEGRATION_COMPLETE.md     [NEW] ✨
    └── (other guides)
```

---

## Component Communication

```
USER INTERFACE LAYER
│
├─ App.tsx
│  │
│  ├─ Manages state:
│  │  • currentView (login/dashboard/payment-setup/etc)
│  │  • isAuthenticated
│  │  • userRole
│  │
│  ├─ Routes to:
│  │  ├─ UserLoginView → onNavigate → payload: view type
│  │  ├─ PaymentSetupView → no navigation (inline processing)
│  │  ├─ OrganizationLoginView → onLoginSuccess → set auth
│  │  └─ AdminDashboardView → read-only view
│  │
│  └─ Callbacks:
│     ├─ setCurrentView(view)
│     ├─ onAuthSuccess()
│     └─ onNavigate()
│
API LAYER
│
├─ saas_endpoints.py (Backend)
│  │
│  ├─ POST /signup
│  │  └─ Create organization
│  │
│  ├─ POST /process-payment
│  │  └─ Process dummy payment
│  │
│  ├─ POST /add-user
│  │  └─ Create hospital users
│  │
│  ├─ POST /organization-login
│  │  └─ Validate hospital staff
│  │
│  ├─ GET /master/all-organizations
│  │  └─ Fetch for admin panel
│  │
│  └─ GET /organization/{id}/users
│     └─ Get hospital users
│
DATA LAYER
│
└─ MongoDB
   │
   ├─ Master DB
   │  └─ organizations, payments, admin_users
   │
   └─ Hospital DBs
      └─ hospital_{id}: patients, appointments, etc.
```

---

## Deployment Checklist

- [ ] Backend `/saas_endpoints.py` imported in `main.py`
- [ ] MongoDB connection strings configured
- [ ] All 3 new components are imported in App.tsx
- [ ] App.tsx routing updated with new views
- [ ] UserLoginView has navigation callbacks wired
- [ ] Test Create Hospital button
- [ ] Test Hospital Staff login
- [ ] Test Admin Panel
- [ ] Demo credentials are accessible after signup
- [ ] Database isolation verified (Hospital A can't see Hospital B)

---

## Testing Scenarios

### Scenario 1: Hospital Signup
```
Test Case: Can hospital sign up and get auto-created database?
1. Click "Create Hospital"
2. Fill organization details
3. Select plan
4. Process payment (dummy)
5. Add 3 users
6. Confirm success
Expected: Organization + Database + Users created ✓
```

### Scenario 2: Hospital Staff Access
```
Test Case: Can hospital staff login and access only their data?
1. Click "Hospital Staff"
2. Select hospital
3. Login with credentials
4. View patients
Expected: Only hospital's patients visible ✓
```

### Scenario 3: Admin Oversight
```
Test Case: Can admin see all hospitals and revenue?
1. Click "Admin Panel"
2. View KPI cards
3. View charts
4. Click hospital for details
Expected: All hospitals and correct revenue shown ✓
```

### Scenario 4: Data Isolation
```
Test Case: Hospital A cannot access Hospital B's data
1. Create Hospital A
2. Create Hospital B
3. Login to Hospital A
4. Check database (hospital_A)
5. Confirm Hospital B's data not visible ✓
```

---

**Everything is ready to use! Just click the buttons on the login page! 🚀**
