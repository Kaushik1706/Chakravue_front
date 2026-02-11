# MongoDB Atlas - Exact Code Changes Required

## What Needs to Change

You need to update ONE file: `backend/saas_endpoints.py`

The new MongoDB Atlas Manager code is already created in `backend/mongodb_atlas_manager.py`

---

## File: backend/saas_endpoints.py

### Change 1: Add Import at Top

**Find this section** (around line 1-15):
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import pymongo
from typing import List, Optional
import json
```

**Add this import** after the existing imports:
```python
from mongodb_atlas_manager import provision_hospital_database
```

**Result:**
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import pymongo
from typing import List, Optional
import json
from mongodb_atlas_manager import provision_hospital_database  # ← ADD THIS LINE
```

---

### Change 2: Update `/process-payment` Endpoint

**Find this function** (search for `@router.post("/process-payment")`):

**OLD CODE** (Current):
```python
@router.post("/process-payment")
async def process_payment(payment: PaymentDetails):
    """
    Process hospital payment and verify card details.
    """
    try:
        # Find the organization
        org = organizations.find_one({"organization_id": payment.organization_id})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        # Store payment record
        payment_record = {
            "payment_id": f"PAY-{payment.organization_id}",
            "organization_id": payment.organization_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "card_last_4": payment.card_number[-4:],
            "status": "completed",
            "processed_at": datetime.now()
        }
        master_db["payments"].insert_one(payment_record)
        
        # Update organization status
        organizations.update_one(
            {"organization_id": payment.organization_id},
            {"$set": {
                "payment_status": "completed",
                "payment_date": datetime.now(),
                "status": "active"
            }}
        )
        
        return {
            "status": "payment_completed",
            "organization_id": payment.organization_id,
            "message": "Payment processed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**NEW CODE** (Replace with this):
```python
@router.post("/process-payment")
async def process_payment(payment: PaymentDetails):
    """
    Process hospital payment and create MongoDB Atlas database.
    """
    try:
        # Find the organization
        org = organizations.find_one({"organization_id": payment.organization_id})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        # Store payment record
        payment_record = {
            "payment_id": f"PAY-{payment.organization_id}",
            "organization_id": payment.organization_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "card_last_4": payment.card_number[-4:],
            "status": "completed",
            "processed_at": datetime.now()
        }
        master_db["payments"].insert_one(payment_record)
        
        # 🎯 PROVISION MONGODB ATLAS DATABASE
        print(f"\n📡 Creating MongoDB Atlas cluster for {org['organization_name']}...")
        atlas_result = provision_hospital_database(
            hospital_name=org["organization_name"],
            hospital_email=org["organization_email"]
        )
        print(f"✓ Atlas cluster created: {atlas_result['cluster_name']}")
        
        # Update organization with Atlas connection details
        organizations.update_one(
            {"organization_id": payment.organization_id},
            {"$set": {
                "payment_status": "completed",
                "payment_date": datetime.now(),
                "status": "active",
                # Atlas connection details
                "atlas_cluster_id": atlas_result["cluster_id"],
                "atlas_cluster_name": atlas_result["cluster_name"],
                "database_name": atlas_result["database_name"],
                "database_uri": atlas_result["connection_string"],
                "db_user": atlas_result["db_user"],
                "db_password": atlas_result["db_password"],
                "database_type": "mongodb_atlas"
            }}
        )
        
        return {
            "status": "payment_completed",
            "organization_id": payment.organization_id,
            "database_created": True,
            "cluster_name": atlas_result["cluster_name"],
            "database_name": atlas_result["database_name"],
            "connection_string": atlas_result["connection_string"],
            "credentials": {
                "username": atlas_result["db_user"],
                "password": atlas_result["db_password"]
            },
            "message": f"MongoDB Atlas cluster '{atlas_result['cluster_name']}' created successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment processing failed: {str(e)}")
```

---

### Change 3: Update `/add-user` Endpoint (Optional but Recommended)

**Find this function** (search for `@router.post("/add-user")`):

**This endpoint should use the hospital's Atlas database instead of creating a new local connection.**

**Update the MongoDB connection line** from:
```python
# OLD: Connect to hospital database
hospital_db_uri = f"mongodb://localhost:27017/hospital_{payment.organization_id}"
hospital_client = pymongo.MongoClient(hospital_db_uri)
```

To:
```python
# NEW: Get connection string from master DB
org = organizations.find_one({"organization_id": user_setup.organization_id})
if not org or "database_uri" not in org:
    raise HTTPException(status_code=404, detail="Hospital database not configured")

hospital_client = pymongo.MongoClient(org["database_uri"])
hospital_db = hospital_client[org["database_name"]]
```

---

## Environment Variables

### Create `.env` file in `backend/` directory

```
# MongoDB Atlas Configuration
MONGODB_ATLAS_PUBLIC_KEY=your_public_api_key_here
MONGODB_ATLAS_PRIVATE_KEY=your_private_api_key_here
MONGODB_ATLAS_ORG_ID=your_organization_id_here
MONGODB_ATLAS_PROJECT_ID=your_project_id_here

# Optional: Application server IP for whitelist
APP_SERVER_IP=0.0.0.0
```

### How to Get These Values

**1. PUBLIC_KEY and PRIVATE_KEY:**
- Go to https://cloud.mongodb.com/v2
- Top left → Organization → Settings
- Access Manager → API Keys
- Create API Key → Copy both keys

**2. ORG_ID:**
- In MongoDB Atlas URL: `https://cloud.mongodb.com/v2/ORG_ID`
- Copy the ORG_ID part

**3. PROJECT_ID:**
- In MongoDB Atlas URL: `https://cloud.mongodb.com/v2/ORG_ID/groups/PROJECT_ID`
- Or in Project Settings, copy the PROJECT_ID

---

## Load Environment Variables in main.py

Add this near the top of `backend/main.py`:

```python
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
```

Install python-dotenv if not already installed:
```bash
pip install python-dotenv
```

---

## Complete Step-by-Step

### Step 1: Copy MongoDB Atlas Manager
✅ Already created: `backend/mongodb_atlas_manager.py`

### Step 2: Create .env File
In `backend/` folder, create `.env`:
```
MONGODB_ATLAS_PUBLIC_KEY=your_key
MONGODB_ATLAS_PRIVATE_KEY=your_key
MONGODB_ATLAS_ORG_ID=your_id
MONGODB_ATLAS_PROJECT_ID=your_id
```

### Step 3: Install Required Package
```bash
pip install requests python-dotenv
```

### Step 4: Update main.py
Add at the top:
```python
from dotenv import load_dotenv
load_dotenv()
```

### Step 5: Update saas_endpoints.py
- Add import: `from mongodb_atlas_manager import provision_hospital_database`
- Replace `/process-payment` endpoint with NEW CODE above

### Step 6: Test

```bash
# Start backend
uvicorn main:app --reload --port 8008

# In another terminal, test:
# Click "Create Hospital" in your app
# Fill form and pay (dummy)
# Should see: "MongoDB Atlas cluster created successfully!"
# Check MongoDB Atlas dashboard - new cluster should appear!
```

---

## Visual Diff

```diff
# backend/saas_endpoints.py

+ from mongodb_atlas_manager import provision_hospital_database

  @router.post("/process-payment")
  async def process_payment(payment: PaymentDetails):
      try:
          org = organizations.find_one(...)
-         # Just store payment
+         # 🎯 NOW ALSO CREATE ATLAS DATABASE
+         atlas_result = provision_hospital_database(
+             hospital_name=org["organization_name"],
+             hospital_email=org["organization_email"]
+         )
          
          organizations.update_one(
              {"organization_id": payment.organization_id},
              {"$set": {
                  "payment_status": "completed",
                  "payment_date": datetime.now(),
+                 "atlas_cluster_id": atlas_result["cluster_id"],
+                 "database_uri": atlas_result["connection_string"],
+                 "db_user": atlas_result["db_user"],
+                 "db_password": atlas_result["db_password"]
              }}
          )
```

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `backend/mongodb_atlas_manager.py` | ✅ Already created | Connects to Atlas API |
| `backend/saas_endpoints.py` | 📝 Update | Add Atlas call |
| `backend/main.py` | 📝 Update | Load .env variables |
| `backend/.env` | 🔧 Create | Store API keys |
| `requirements.txt` | 📝 Update | Add requests, python-dotenv |

---

## Minimal Change Required

If you just want quick implementation:

**In `saas_endpoints.py`, replace the `/process-payment` function with the NEW CODE shown above.**

That's the minimum change needed!

---

## After These Changes

When hospital signs up:
```
1. Fill form
2. Select plan
3. Enter card
4. Click "Create Organization"
   ↓
5. Backend creates hospital record
6. Backend calls MongoDB Atlas API ← NEW!
7. MongoDB Atlas creates cloud database
8. Backend stores connection details
9. Hospital gets credentials
   ↓
✅ Ready to use!
```

---

## Test Command

To verify everything works:

```bash
# In Python terminal
from backend.mongodb_atlas_manager import provision_hospital_database

result = provision_hospital_database(
    hospital_name="Test Hospital",
    hospital_email="test@hospital.com"
)

print(result)
# Should output: cluster created successfully!
```

---

**That's all the code changes needed!** ✅
