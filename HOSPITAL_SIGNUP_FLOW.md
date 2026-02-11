# Hospital Signup Flow - Plan-Based Database Creation

## What Happens End-to-End

```
STEP 1: Hospital Chooses Plan
┌─────────────────────────────────┐
│ Starter ($99)    - 5 users      │
│ Professional ($299) - 20 users  │  ← Hospital chooses one
│ Enterprise ($999) - unlimited   │
└─────────────────────────────────┘
         ↓ Hospital clicks "Select"

STEP 2: Hospital Fills Organization Details
┌─────────────────────────────────┐
│ Hospital Name: City Eye Clinic  │
│ Email: admin@cityeye.com        │
│ Phone: +1234567890              │
└─────────────────────────────────┘
         ↓ Hospital clicks "Continue"

STEP 3: Hospital Enters Payment
┌─────────────────────────────────┐
│ Card: 4111111111111111          │
│ Amount: $299 (Professional)     │
│ Expiry: 12/25, CVV: 123         │
└─────────────────────────────────┘
         ↓ Hospital clicks "Pay Now"

STEP 4: Backend Automatically Creates Database
┌─────────────────────────────────┐
│ ✅ Payment Verified              │
│ ✅ Organization Created          │
│ ✅ MongoDB Atlas Database        │
│    - Name: hospital_city_eye    │
│    - Plan: Professional tier     │
│ ✅ Database User Created         │
│    - Username: admin            │
│    - Password: secure_random    │
│ ✅ Connection String Generated  │
└─────────────────────────────────┘
         ↓

STEP 5: Hospital Gets Their Database
┌─────────────────────────────────┐
│ Success! Your database ready!   │
│                                 │
│ 🔗 Connection: mongodb+srv://.. │
│ 👤 Username: admin              │
│ 🔐 Password: [secure_random]    │
│ 💾 Database: hospital_city_eye  │
│ 📊 Plan: Professional (20 users)│
│ 🆓 Free tier + Upgrade ready    │
└─────────────────────────────────┘
         ↓

STEP 6: Hospital Staff Login
┌─────────────────────────────────┐
│ Hospital Staff selects:         │
│ "City Eye Clinic"               │
│ Enter: email + password         │
│        ↓                         │
│ Backend connects to THEIR       │
│ hospital_city_eye database      │
│        ↓                         │
│ Staff sees ONLY their data      │
└─────────────────────────────────┘
```

---

## Plan Mapping to Database Tier

### Starter Plan ($99)
```
Hospital chooses: Starter
     ↓
Backend creates:
  ├─ MongoDB Atlas cluster: "hospital_name"
  ├─ Database tier: M0 (Free, 512MB)
  ├─ Database user: admin
  ├─ Max users: 5
  ├─ Max storage: 512MB
  └─ Features: Basic

Hospital gets:
  ✅ Free M0 database forever
  ✅ 512MB storage
  ✅ Can upgrade anytime
```

### Professional Plan ($299)
```
Hospital chooses: Professional
     ↓
Backend creates:
  ├─ MongoDB Atlas cluster: "hospital_name"
  ├─ Database tier: M2 (Paid, $9/mo, 2GB)
  ├─ Database user: admin
  ├─ Max users: 20
  ├─ Max storage: 2GB
  └─ Features: Advanced

Hospital gets:
  ✅ M2 database ($9/mo ongoing)
  ✅ 2GB storage
  ✅ Advanced analytics
  ✅ Priority support
```

### Enterprise Plan ($999)
```
Hospital chooses: Enterprise
     ↓
Backend creates:
  ├─ MongoDB Atlas cluster: "hospital_name"
  ├─ Database tier: M5 (Paid, $57/mo, 10GB)
  ├─ Database user: admin
  ├─ Max users: Unlimited
  ├─ Max storage: 10GB
  └─ Features: Custom

Hospital gets:
  ✅ M5 database ($57/mo ongoing)
  ✅ 10GB storage
  ✅ Custom analytics
  ✅ 24/7 support
```

---

## How It Works in Code

### Frontend: PaymentSetupView.tsx
```typescript
// User selects plan
const handleSelectPlan = (plan: Plan) => {
  setSelectedPlan(plan);  // Saves Starter/Professional/Enterprise
  setStep('organization');
};

// User pays
const handlePaymentSubmit = async (e: React.FormEvent) => {
  // Call backend: /process-payment
  // Pass: organizationName, email, phone, selectedPlan
};
```

### Backend: saas_endpoints.py
```python
@router.post("/process-payment")
async def process_payment(payment: PaymentDetails):
    """
    1. Verify payment
    2. Create organization in master DB
    3. Call MongoDB Atlas Manager with PLAN INFO
    4. Return database credentials
    """
    
    # Get hospital plan from payment data
    hospital_plan = payment.plan  # "professional", "starter", "enterprise"
    
    # Create database on MongoDB Atlas
    # Plan determines the MongoDB tier created
    database_credentials = provision_hospital_database(
        hospital_name=payment.hospital_name,
        hospital_email=payment.hospital_email,
        plan=hospital_plan  # ← Plan determines tier!
    )
    
    return {
        "status": "success",
        "database_name": database_credentials["database_name"],
        "connection_string": database_credentials["connection_string"],
        "username": database_credentials["username"],
        "password": database_credentials["password"],
        "plan_tier": database_credentials["plan_tier"]
    }
```

### MongoDB Atlas Manager: mongodb_atlas_manager.py
```python
class MongoDBAtlasManager:
    def create_cluster(self, hospital_name, hospital_email, plan):
        """
        Create MongoDB Atlas cluster based on PLAN
        """
        
        # Map plan to MongoDB tier
        tier_mapping = {
            "starter": "M0",        # Free, 512MB
            "professional": "M2",   # $9/mo, 2GB
            "enterprise": "M5"      # $57/mo, 10GB
        }
        
        tier = tier_mapping.get(plan, "M0")
        
        # Create cluster on MongoDB with this tier
        cluster_data = {
            "name": f"hospital-{hospital_name}",
            "providerSettings": {
                "providerName": "AWS",
                "instanceSizeName": tier  # ← Tier from plan!
            }
        }
        
        # Call MongoDB Atlas API
        response = requests.post(
            f"{self.base_url}/clusters",
            json=cluster_data,
            auth=(self.public_key, self.private_key)
        )
        
        return response.json()
```

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   HOSPITAL SIGNUP                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │ Choose Plan      │
                    │ • Starter ($99)  │
                    │ • Prof ($299)    │
                    │ • Ent ($999)     │
                    └──────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │ Fill Details     │
                    │ • Name           │
                    │ • Email          │
                    │ • Phone          │
                    └──────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │ Enter Payment    │
                    │ • Card: ****1111 │
                    │ • $299           │
                    │ • CVV: 123       │
                    └──────────────────┘
                              │
                              ↓
                    ┌──────────────────────────┐
                    │ BACKEND PROCESSES        │
                    │ 1. Verify payment ✓      │
                    │ 2. Create org in DB ✓    │
                    │ 3. Get plan tier ✓       │
                    └──────────────────────────┘
                              │
                              ↓
                    ┌──────────────────────────┐
                    │ MONGODB ATLAS CREATES    │
                    │ 1. Cluster ✓             │
                    │ 2. Database ✓            │
                    │ 3. User ✓                │
                    │ 4. Tier (M0/M2/M5) ✓    │
                    └──────────────────────────┘
                              │
                              ↓
                    ┌──────────────────────────┐
                    │ SUCCESS! HOSPITAL GETS   │
                    │ • Database name          │
                    │ • Connection string      │
                    │ • Username & password    │
                    │ • Plan tier (M0/M2/M5)  │
                    │ • Ready to use!          │
                    └──────────────────────────┘
                              │
                              ↓
                    ┌──────────────────────────┐
                    │ HOSPITAL STAFF LOGIN     │
                    │ 1. Select hospital      │
                    │ 2. Enter credentials    │
                    │ 3. See THEIR data only  │
                    │ 4. Completely isolated  │
                    └──────────────────────────┘
```

---

## What Hospital Gets Based on Plan

### Storage & Performance
| Plan | Storage | Tier | Cost | Users |
|------|---------|------|------|-------|
| Starter | 512MB | M0 | $0 | 5 |
| Professional | 2GB | M2 | $9/mo | 20 |
| Enterprise | 10GB | M5 | $57/mo | Unlimited |

### Features
| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Cloud Database | ✅ | ✅ | ✅ |
| Data Isolation | ✅ | ✅ | ✅ |
| Users | 5 | 20 | Unlimited |
| Storage | 512MB | 2GB | 10GB |
| Analytics | Basic | Advanced | Custom |
| Support | Email | Priority | 24/7 |
| Backup | ✅ | ✅ | ✅ |
| Upgrade Anytime | ✅ | ✅ | ✅ |

---

## How to Test This End-to-End

### Prerequisites
```bash
1. MongoDB Atlas account (free signup)
2. API keys in .env file
3. mongodb_atlas_manager.py in backend/
4. Backend updated with manager import
```

### Test Starter Plan
```
1. Click "Create Hospital"
2. Select: Starter plan
3. Fill: TestHosp1, test1@hospital.com, +1234567890
4. Pay: 4111111111111111 (dummy)
5. Verify:
   ├─ Success message shows M0 tier
   ├─ MongoDB Atlas shows new cluster
   ├─ 512MB storage visible
```

### Test Professional Plan
```
1. Click "Create Hospital"
2. Select: Professional plan
3. Fill: TestHosp2, test2@hospital.com, +1234567890
4. Pay: 4111111111111111 (dummy)
5. Verify:
   ├─ Success message shows M2 tier
   ├─ MongoDB Atlas shows M2 cluster
   ├─ 2GB storage visible
   ├─ 20 users limit set
```

### Test Enterprise Plan
```
1. Click "Create Hospital"
2. Select: Enterprise plan
3. Fill: TestHosp3, test3@hospital.com, +1234567890
4. Pay: 4111111111111111 (dummy)
5. Verify:
   ├─ Success message shows M5 tier
   ├─ MongoDB Atlas shows M5 cluster
   ├─ 10GB storage visible
   ├─ Unlimited users
```

---

## Automatic Upgrade Path

### Day 1: Hospital Signs Up (Free Starter)
```
Starter plan ($0)
├─ M0 database created
├─ 512MB storage
├─ Hospital ready to use
└─ No payment yet
```

### Month 3: Hospital Growing
```
Hospital clicks "Upgrade"
     ↓
Chooses: Professional ($299)
     ↓
Pays: $299
     ↓
Backend:
├─ Creates M2 cluster
├─ Migrates data
├─ Updates connection string
├─ Hospital gets 2GB, 20 users
```

### Year 1: Hospital Scaling
```
Hospital clicks "Upgrade"
     ↓
Chooses: Enterprise ($999)
     ↓
Pays: $999
     ↓
Backend:
├─ Creates M5 cluster
├─ Migrates data
├─ Updates all connections
├─ Hospital gets 10GB, unlimited users
├─ 24/7 support
```

---

## Data Isolation Guarantee

Each hospital is **completely isolated**:

```
Master Database (chakravue_master)
├─ Organizations table
│  ├─ Hospital 1: org_1001
│  ├─ Hospital 2: org_1002
│  └─ Hospital 3: org_1003
└─ Payments table
   └─ All payments (for admin only)

Hospital 1's Cloud Database (hospital_city_eye)
├─ Patients: [Hospital 1 patients only]
├─ Appointments: [Hospital 1 appointments only]
└─ Users: [Hospital 1 staff only]
   └─ Hospital 2 staff CANNOT see this

Hospital 2's Cloud Database (hospital_metro_clinic)
├─ Patients: [Hospital 2 patients only]
├─ Appointments: [Hospital 2 appointments only]
└─ Users: [Hospital 2 staff only]
   └─ Hospital 1 staff CANNOT see this

Hospital 3's Cloud Database (hospital_south_clinic)
├─ Patients: [Hospital 3 patients only]
├─ Appointments: [Hospital 3 appointments only]
└─ Users: [Hospital 3 staff only]
   └─ Hospital 1/2 staff CANNOT see this
```

**Key: Each hospital connects to THEIR database using THEIR credentials!**

---

## Backend Code Structure

### 1. Hospital Selects Plan (Frontend)
```typescript
// PaymentSetupView.tsx
const handleSelectPlan = (plan: Plan) => {
  setSelectedPlan(plan);  // "starter", "professional", "enterprise"
};
```

### 2. Hospital Pays (Frontend → Backend)
```typescript
// Call backend with plan
await fetch('/api/process-payment', {
  method: 'POST',
  body: JSON.stringify({
    organization_name: "City Eye Clinic",
    organization_email: "admin@cityeye.com",
    organization_phone: "+1234567890",
    plan: "professional",  // ← Plan goes to backend
    card_number: "4111111111111111"
  })
});
```

### 3. Backend Creates Database (Based on Plan)
```python
# saas_endpoints.py
@router.post("/process-payment")
async def process_payment(payment: PaymentDetails):
    # payment.plan = "professional"
    
    # Create database with plan
    db_creds = provision_hospital_database(
        hospital_name=payment.hospital_name,
        hospital_email=payment.hospital_email,
        plan=payment.plan  # ← Tier determined here
    )
    
    return db_creds  # Connection string, credentials, tier
```

### 4. Manager Creates Right Tier (Atlas API)
```python
# mongodb_atlas_manager.py
def create_cluster(self, hospital_name, plan):
    tier = {
        "starter": "M0",
        "professional": "M2",
        "enterprise": "M5"
    }[plan]
    
    # Create cluster on MongoDB with tier
    requests.post(
        f"{self.base_url}/clusters",
        json={"name": f"hospital-{hospital_name}", "tier": tier}
    )
```

### 5. Hospital Gets Database (Based on Plan Chosen)
```
Plan: Professional
  ↓
Tier: M2
  ↓
Database: hospital_city_eye (2GB capacity)
  ↓
Users: 20 max
  ↓
Cost: $9/mo
  ↓
Ready to use!
```

---

## Summary

✅ **Hospital chooses plan**
✅ **Hospital pays** (dummy card for testing)
✅ **Backend automatically creates database** based on plan
✅ **Plan determines database tier:**
  - Starter → M0 (free, 512MB)
  - Professional → M2 ($9/mo, 2GB)
  - Enterprise → M5 ($57/mo, 10GB)
✅ **Hospital immediately ready to use their cloud database**
✅ **Can upgrade tier anytime**
✅ **Complete data isolation between hospitals**

**This is fully automatic - no manual intervention needed!**
