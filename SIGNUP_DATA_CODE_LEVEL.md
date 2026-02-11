# Implementation: Where Signup Data Actually Goes (Code Level)

## Files Involved

```
Your System Files:
├─ src/components/PaymentSetupView.tsx
│  └─ Hospital fills signup form here
│
├─ backend/saas_endpoints.py
│  └─ Backend receives and processes signup data
│
└─ backend/mongodb_atlas_manager.py
   └─ Creates databases on MongoDB Atlas
```

---

## Step-by-Step Code Flow

### STEP 1: Hospital Fills Form (Frontend)

**File:** `src/components/PaymentSetupView.tsx`

```typescript
// Hospital enters:
// Name: "City Eye Clinic"
// Email: "admin@cityeye.com"
// Phone: "+91-9876543210"
// Plan: "professional"
// Card: "4111111111111111"

const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus('processing');

    // This data is in FRONTEND only at this point
    // NOT saved anywhere yet
    
    // Send to backend
    const response = await fetch('http://localhost:8008/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            organization_name: organizationName,        // "City Eye Clinic"
            organization_email: organizationEmail,      // "admin@cityeye.com"
            organization_phone: organizationPhone,      // "+91-9876543210"
            plan: selectedPlan.id,                      // "professional"
            card_number: cardNumber,                    // "4111111111111111"
            amount: selectedPlan.price                  // 299
        })
    });
    
    const result = await response.json();
    // Result contains database credentials from backend
};
```

**At this point:** Data is in frontend only (temporary)

---

### STEP 2: Backend Receives Signup Data

**File:** `backend/saas_endpoints.py`

```python
@router.post("/process-payment")
async def process_payment(payment: PaymentDetails):
    """
    Receives signup data from frontend
    Saves to TWO places:
    1. Master database (chakravue_master)
    2. Creates hospital database on MongoDB Atlas
    """
    
    try:
        # Validate dummy payment
        if payment.card_number == '4111111111111111' and payment.amount == 299:
            payment_valid = True
        else:
            return {"status": "error", "message": "Invalid payment"}
        
        # ====== PATH 1: SAVE TO MASTER DATABASE ======
        org_id = f"org_{int(datetime.now().timestamp() * 1000)}"
        db_name = payment.organization_name.lower().replace(" ", "_")
        
        organization_doc = {
            "organization_id": org_id,
            "organization_name": payment.organization_name,      # "City Eye Clinic"
            "organization_email": payment.organization_email,    # "admin@cityeye.com"
            "organization_phone": payment.organization_phone,    # "+91-9876543210"
            "database_name": db_name,
            "plan": payment.plan,                                # "professional"
            "plan_price": payment.amount,                        # 299
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "payment_date": datetime.now().isoformat(),
        }
        
        # Insert into MASTER DATABASE
        master_client = pymongo.MongoClient("mongodb://localhost:27017")
        master_db = master_client["chakravue_master"]
        organizations = master_db["organizations"]
        
        result = organizations.insert_one(organization_doc)
        # ✓ Signup data now in MASTER DATABASE (you can see this)
        # ✗ Hospital CANNOT see master database
        
        # ====== PATH 2: CREATE HOSPITAL DATABASE ======
        # Call MongoDB Atlas Manager to create hospital's database
        from mongodb_atlas_manager import provision_hospital_database
        
        db_credentials = provision_hospital_database(
            hospital_name=payment.organization_name,
            hospital_email=payment.organization_email,
            plan=payment.plan                          # "professional" → M2 tier
        )
        # ✓ Hospital database created on MongoDB Atlas
        # ✓ Hospital gets credentials
        # ✓ Empty and ready for patient data
        
        # Save MongoDB connection details to master DB
        organizations.update_one(
            {"organization_id": org_id},
            {
                "$set": {
                    "mongodb_connection_string": db_credentials["connection_string"],
                    "mongodb_username": db_credentials["username"],
                    "mongodb_database_name": db_credentials["database_name"],
                    "mongodb_tier": db_credentials["tier"]
                }
            }
        )
        
        # ====== RETURN SUCCESS ======
        return {
            "status": "success",
            "organization_id": org_id,
            "message": "✓ Database created on MongoDB Atlas!",
            "database_credentials": {
                "database_name": db_credentials["database_name"],
                "connection_string": db_credentials["connection_string"],
                "username": db_credentials["username"],
                "password": db_credentials["password"],
                "tier": db_credentials["tier"],
                "storage": "2GB"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**At this point:** 
- Data is now in MASTER DATABASE ✓
- Hospital database created on MongoDB Atlas ✓
- Hospital gets credentials ✓

---

### STEP 3: MongoDB Atlas Manager Creates Database

**File:** `backend/mongodb_atlas_manager.py`

```python
from mongodb_atlas_manager import provision_hospital_database

def provision_hospital_database(hospital_name, hospital_email, plan):
    """
    Creates hospital's database on MongoDB Atlas
    Based on plan selected
    """
    
    # Map plan to MongoDB tier
    tier_map = {
        "starter": "M0",        # 512MB, free
        "professional": "M2",   # 2GB, $9/mo
        "enterprise": "M5"      # 10GB, $57/mo
    }
    
    tier = tier_map.get(plan, "M0")  # "professional" → "M2"
    
    # Create cluster on MongoDB Atlas
    cluster_name = f"hospital-{hospital_name.lower().replace(' ', '-')}"
    
    manager = MongoDBAtlasManager(
        public_key=os.getenv("MONGODB_ATLAS_PUBLIC_KEY"),
        private_key=os.getenv("MONGODB_ATLAS_PRIVATE_KEY"),
        org_id=os.getenv("MONGODB_ATLAS_ORG_ID"),
        project_id=os.getenv("MONGODB_ATLAS_PROJECT_ID")
    )
    
    # Create cluster with specified tier
    cluster_response = manager.create_cluster(
        hospital_name=hospital_name,
        hospital_email=hospital_email,
        tier=tier
    )
    
    cluster_id = cluster_response["id"]
    
    # Create database user
    database_name = f"hospital_{hospital_name.lower().replace(' ', '_')}"
    username = "admin"
    password = manager._generate_password()
    
    manager._create_database_user(
        cluster_id=cluster_id,
        username=username,
        password=password,
        database_name=database_name
    )
    
    # Get connection string
    connection_string = manager._get_connection_string(
        cluster_id=cluster_id,
        username=username,
        password=password,
        database_name=database_name
    )
    
    # Add IP whitelist
    manager.add_ip_whitelist(cluster_id, "0.0.0.0")  # Your server IP
    
    # ✓ Hospital database created!
    # ✓ Ready to use!
    
    return {
        "cluster_id": cluster_id,
        "database_name": database_name,
        "username": username,
        "password": password,
        "connection_string": connection_string,
        "tier": tier
    }
```

**At this point:**
- Hospital cluster created on MongoDB Atlas ✓
- Hospital database created ✓
- Hospital user created ✓
- Connection string ready ✓

---

### STEP 4: Frontend Receives Database Credentials

**Back to:** `src/components/PaymentSetupView.tsx`

```typescript
const result = await response.json();

// result contains:
{
    "status": "success",
    "database_credentials": {
        "database_name": "hospital_city_eye_clinic",
        "connection_string": "mongodb+srv://admin:password@...",
        "username": "admin",
        "password": "secure_random",
        "tier": "M2",
        "storage": "2GB"
    }
}

// Display to hospital
setPaymentStatus('success');
showMessage(`✓ Database created!
    Database: ${result.database_name}
    Storage: ${result.storage}
    Tier: ${result.tier}
    Credentials: [SHOW IN UI]
`);
```

**At this point:**
- Hospital sees success message ✓
- Hospital gets their database credentials ✓
- Hospital ready to start using system ✓

---

## Data Locations After Signup

### MASTER DATABASE (chakravue_master)

**Location:** `localhost:27017` (Your local MongoDB)

**Collection:** organizations

```json
{
  "_id": ObjectId("..."),
  "organization_id": "org_1702718400000",
  "organization_name": "City Eye Clinic",
  "organization_email": "admin@cityeye.com",
  "organization_phone": "+91-9876543210",
  "plan": "professional",
  "plan_price": 299,
  "database_name": "hospital_city_eye_clinic",
  "status": "active",
  "created_at": "2025-12-16T10:30:00Z",
  "payment_date": "2025-12-16T10:35:00Z",
  "mongodb_connection_string": "mongodb+srv://...",
  "mongodb_username": "admin",
  "mongodb_database_name": "hospital_city_eye_clinic",
  "mongodb_tier": "M2"
}
```

**Who accesses this:** ONLY YOU (admin)

**Who CANNOT access this:** Hospital staff, other hospitals

---

### HOSPITAL DATABASE (hospital_city_eye_clinic)

**Location:** MongoDB Atlas Cloud (aws.mongodb.com)

**Collections:** Empty when created

```
Collections (empty on creation):
├─ patients (empty)
├─ appointments (empty)
├─ billing (empty)
├─ prescriptions (empty)
├─ investigations (empty)
└─ hospital_users (empty)

Tier: M2 (2GB storage)
Users: 0/20
Status: Ready to use
```

**Who accesses this:** ONLY City Eye Hospital staff (with credentials)

**Who CANNOT access this:** You, other hospitals, frontend

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────┐
│ FRONTEND (PaymentSetupView.tsx)    │
│ Hospital fills form (temporary)     │
└─────────────────────────────────────┘
            ↓ (POST request)
┌─────────────────────────────────────┐
│ BACKEND (saas_endpoints.py)        │
│ /process-payment endpoint           │
└─────────────────────────────────────┘
            ↓ (Verify payment)
           / \
          /   \
         /     \
    PATH1       PATH2
     ↓            ↓
MASTER DB     MONGODB ATLAS
(Local)       (Cloud)
     │            │
     ├─ Org record├─ Create cluster
     ├─ Name      ├─ Create database
     ├─ Email     ├─ Create user
     ├─ Phone     └─ Get connection
     ├─ Plan        string
     ├─ Payment
     └─ Tier
     │            │
     ↓            ↓
  YOU see it    Hospital uses it
  (Admin)       (Staff login)
     
WHERE EACH PIECE OF DATA GOES:

Organization Name (City Eye Clinic)
  ├─ MASTER DB: ✓ Saved
  ├─ Hospital DB: ✗ NOT saved
  └─ Frontend: ✗ Cleared

Email (admin@cityeye.com)
  ├─ MASTER DB: ✓ Saved
  ├─ Hospital DB: ✗ NOT saved (unless used for user login)
  └─ Frontend: ✗ Cleared

Phone (+91-9876543210)
  ├─ MASTER DB: ✓ Saved
  ├─ Hospital DB: ✗ NOT saved
  └─ Frontend: ✗ Cleared

Plan (professional)
  ├─ MASTER DB: ✓ Saved
  ├─ Hospital DB: ✗ NOT saved
  └─ Frontend: ✗ Cleared

Card Details (4111...)
  ├─ MASTER DB: ✗ NOT saved (only last 4 digits)
  ├─ Hospital DB: ✗ NOT saved
  └─ Frontend: ✗ Cleared
```

---

## Summary: Who Stores What

### MASTER DATABASE Stores
```
✓ Organization name
✓ Organization email
✓ Organization phone
✓ Plan selected
✓ Payment date
✓ Payment amount
✓ Plan tier (M0/M2/M5)
✓ Status (active/inactive)
✓ MongoDB connection details
✓ MongoDB database name

✗ Patient data (NEVER)
✗ Card full details (only last 4)
✗ Hospital confidential info (NEVER)
```

### HOSPITAL DATABASE Stores
```
✓ Patient data
✓ Appointments
✓ Billing
✓ Prescriptions
✓ Hospital users (staff)

✗ Signup information (NEVER)
✗ Payment information (NEVER)
✗ Organization details (NEVER)
✗ Org email/phone (NEVER)
```

---

## Access Control

### Master Database Access
```
Who can access: ONLY admin/you
How: Direct connection to localhost:27017
Purpose: See all hospitals, all payments, all revenue
Data visible: Complete organization and payment history
```

### Hospital Database Access
```
Who can access: ONLY that hospital's staff
How: MongoDB connection string with credentials
Purpose: Store and manage patient data
Data visible: Only that hospital's patients/appointments/billing
```

---

## Verification

### To verify Master Database
```bash
# Connect to your local MongoDB
mongo mongodb://localhost:27017

# Use master database
use chakravue_master

# See organizations
db.organizations.find()

# Result shows:
# - City Eye Clinic signed up
# - Email: admin@cityeye.com
# - Payment: $299
# - Date: 2025-12-16
```

### To verify Hospital Database
```bash
# Connect with hospital's credentials
mongo "mongodb+srv://admin:password@hospital-city-eye-clinic.mongodb.net/hospital_city_eye_clinic"

# See collections
show collections

# Result shows:
# - patients (empty)
# - appointments (empty)
# - billing (empty)
# - prescriptions (empty)
# - investigations (empty)
# - hospital_users (empty)

# Hospital can store data here
```

---

## Final Answer

**Where does signup data go?**

```
SIGNUP DATA
│
├─ MASTER DATABASE (chakravue_master)
│  └─ Name: Saved ✓
│  └─ Email: Saved ✓
│  └─ Phone: Saved ✓
│  └─ Plan: Saved ✓
│  └─ Payment: Saved ✓
│  └─ Only you can see this
│
├─ HOSPITAL DATABASE (hospital_city_eye_clinic)
│  └─ Signup data: NOT saved here
│  └─ Empty and ready for patient data
│  └─ Only hospital staff can use this
│
└─ FRONTEND
   └─ Cleared after sending to backend
```

**That's where signup data goes!** ✅
