# MongoDB Atlas Integration Setup Guide

## Overview
This guide explains how to connect MongoDB Atlas (cloud) to your SaaS hospital signup system. After a hospital pays, it will **automatically** get its own MongoDB Atlas database.

---

## Step 1: Create MongoDB Atlas Account

### 1.1 Sign up for MongoDB Atlas
- Go to: https://www.mongodb.com/cloud/atlas
- Click "Try Free"
- Create account with your email
- Verify email

### 1.2 Create Organization & Project
1. After login, create a new organization (or use default)
2. Create a new project (e.g., "Chakravue Hospitals")
3. Note the **Project ID** (you'll need this)

---

## Step 2: Get API Credentials

### 2.1 Enable API Access
1. Go to: **Organization Settings** → **Access Manager**
2. Click **Create API Key**
3. Set permissions:
   - ✅ Organization Member
   - ✅ Organization Project Creator
4. Create and note:
   - **Public Key** (like username)
   - **Private Key** (like password) - SAVE THIS!
5. Add your IP to whitelist (or use 0.0.0.0/0 for testing)

### 2.2 Get Organization ID
1. In Atlas dashboard top-left, click your **Organization**
2. URL shows: `https://cloud.mongodb.com/v2/ORG_ID`
3. Copy the `ORG_ID` part

### 2.3 Get Project ID
1. In your Project settings
2. URL shows: `https://cloud.mongodb.com/v2/PROJECT_ID`
3. Copy the `PROJECT_ID` part

---

## Step 3: Configure Environment Variables

Create a `.env` file in your backend directory (or add to existing):

```bash
# MongoDB Atlas Configuration
MONGODB_ATLAS_PUBLIC_KEY=your_public_key_here
MONGODB_ATLAS_PRIVATE_KEY=your_private_key_here
MONGODB_ATLAS_ORG_ID=your_org_id_here
MONGODB_ATLAS_PROJECT_ID=your_project_id_here

# Master Database (local or cloud)
MONGODB_MASTER_URI=mongodb://localhost:27017
# Or if using Atlas for master:
# MONGODB_MASTER_URI=mongodb+srv://username:password@cluster.mongodb.net/chakravue_master

# Application Server IP (for whitelist)
APP_SERVER_IP=your_server_ip_or_0.0.0.0
```

---

## Step 4: Install Required Package

```bash
pip install requests
```

This package is needed to communicate with MongoDB Atlas API.

---

## Step 5: Update Backend Files

### 5.1 Update main.py
Add this import at the top:

```python
from mongodb_atlas_manager import provision_hospital_database
```

### 5.2 Update saas_endpoints.py
Update the `/process-payment` endpoint to use Atlas:

```python
from mongodb_atlas_manager import provision_hospital_database

@router.post("/process-payment")
async def process_payment(payment: PaymentDetails):
    """
    Process hospital payment and create MongoDB Atlas database
    """
    try:
        # Find organization
        org = organizations.find_one({"organization_id": payment.organization_id})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        # Process dummy payment
        payment_record = {
            "payment_id": f"PAY-{payment.organization_id}",
            "organization_id": payment.organization_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "card_last_4": payment.card_number[-4:],
            "status": "completed",
            "processed_at": datetime.now()
        }
        
        # Store payment record
        master_db["payments"].insert_one(payment_record)
        
        # 🎯 PROVISION MONGODB ATLAS DATABASE
        atlas_result = provision_hospital_database(
            hospital_name=org["organization_name"],
            hospital_email=org["organization_email"]
        )
        
        # Store Atlas connection details
        master_db["organizations"].update_one(
            {"organization_id": payment.organization_id},
            {"$set": {
                "payment_status": "completed",
                "payment_date": datetime.now(),
                "atlas_cluster_id": atlas_result["cluster_id"],
                "atlas_cluster_name": atlas_result["cluster_name"],
                "database_name": atlas_result["database_name"],
                "database_uri": atlas_result["connection_string"],
                "db_user": atlas_result["db_user"],
                "db_password": atlas_result["db_password"],
                "status": "active"
            }}
        )
        
        return {
            "status": "payment_completed",
            "organization_id": payment.organization_id,
            "database_created": True,
            "cluster_name": atlas_result["cluster_name"],
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

## Step 6: Update Frontend Payment Confirmation

Update `PaymentSetupView.tsx` to show Atlas connection details:

```tsx
// After successful payment, show Atlas credentials
{showSuccess && (
  <div className="space-y-4">
    <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
      <h3 className="font-bold text-green-400">✓ Database Created on MongoDB Atlas!</h3>
      
      <div className="mt-4 space-y-2 text-sm">
        <p>Cluster: <code className="bg-black p-1">{creationResult.cluster_name}</code></p>
        <p>Database: <code className="bg-black p-1">hospital_{creationResult.cluster_name}</code></p>
        
        <div className="mt-3 p-3 bg-black rounded">
          <p className="text-gray-400">Connection String:</p>
          <code className="text-xs break-all">{creationResult.connection_string}</code>
        </div>
        
        <p>Username: <code className="bg-black p-1">{creationResult.credentials.username}</code></p>
        <p>Password: <code className="bg-black p-1">{creationResult.credentials.password}</code></p>
      </div>
    </div>
  </div>
)}
```

---

## Step 7: Test the Integration

### Test Hospital Signup
1. Open your app
2. Click **"Create Hospital"**
3. Fill in hospital details:
   - Name: "Test Hospital"
   - Email: "test@hospital.com"
   - Phone: "1234567890"
4. Select plan: "Professional"
5. Enter dummy card: `4111111111111111`
6. Click "Create Organization"

### Expected Result
```
✓ Hospital registered
✓ MongoDB Atlas cluster created with name: test-hospital
✓ Database: hospital_test_hospital
✓ Connection details shown on screen
✓ Check MongoDB Atlas dashboard → You see new cluster!
```

---

## Step 8: Verify in MongoDB Atlas Dashboard

1. Go to: https://cloud.mongodb.com/v2
2. Navigate to your Project
3. Click **"Clusters"**
4. You should see new cluster named after your hospital!
5. Click cluster → **"Connect"** to see connection string

---

## MongoDB Atlas Tiers

### Free Tier (M0)
- Current implementation
- 512MB storage
- Perfect for testing
- No charge (forever free)
- Limitations:
  - 3 nodes (auto-sharded)
  - No backups
  - No private endpoints

### Paid Tiers (M2, M5, M10, etc.)
To upgrade later:
1. Go to **Cluster Settings**
2. Click **"Scale Cluster"**
3. Select tier (M2 = $9/month, M5 = $57/month, etc.)
4. Apply changes

---

## Hospital Billing (For Later)

When you want to charge hospitals for database upgrades:

```python
def upgrade_hospital_database(hospital_id: str, new_tier: str):
    """
    Upgrade hospital's database tier on MongoDB Atlas
    new_tier: 'M2', 'M5', 'M10', etc.
    """
    # Get hospital details
    org = organizations.find_one({"organization_id": hospital_id})
    cluster_id = org["atlas_cluster_id"]
    
    # Call Atlas API to upgrade
    update_config = {
        "providerSettings": {
            "instanceSizeName": new_tier
        }
    }
    
    url = f"https://cloud.mongodb.com/api/atlas/v1.30/groups/{project_id}/clusters/{cluster_id}"
    response = requests.patch(url, json=update_config, auth=auth)
    
    if response.status_code == 200:
        # Update in master DB
        organizations.update_one(
            {"organization_id": hospital_id},
            {"$set": {"current_tier": new_tier}}
        )
        return True
    return False
```

---

## Troubleshooting

### ❌ "API Key Authentication Failed"
- Check PUBLIC_KEY and PRIVATE_KEY are correct
- Verify API key still exists in MongoDB Atlas
- Check IP whitelist includes your server

### ❌ "Cluster Creation Failed"
- Check project ID is correct
- Verify region "us-east-1" is available
- Check API key has enough permissions

### ❌ "Connection String Not Available"
- Cluster might still be initializing (takes 5-10 mins)
- Check cluster status in MongoDB Atlas dashboard
- Try again after cluster shows "IDLE" status

### ❌ "Database User Creation Failed"
- Username might be invalid (must be alphanumeric)
- Check password meets MongoDB requirements
- Verify user doesn't already exist

---

## What Hospitals Get

After paying for signup:

```
✅ Their own MongoDB Atlas cluster
✅ Cluster name: hospital_{name}
✅ Database: hospital_{name}
✅ Username & password for access
✅ Connection string for apps
✅ 512MB free storage
✅ Upgradeable anytime to paid tiers
```

---

## Security Notes

🔐 **Important:**
- Store API keys in environment variables (never in code)
- Connection strings are sensitive - don't expose to frontend
- Use IP whitelist to restrict cluster access
- Change database passwords regularly
- Monitor Atlas usage and billing

---

## Cost Breakdown

- **Free Tier (M0):** $0/month (forever free)
- **Tier M2:** $9/month
- **Tier M5:** $57/month
- **Tier M10:** $110/month
- **Tier M20:** $220/month
- **Tier M30:** $443/month

Your hospitals start free, can upgrade anytime!

---

## Next Steps

1. ✅ Create MongoDB Atlas account
2. ✅ Get API credentials
3. ✅ Set environment variables
4. ✅ Install `requests` package
5. ✅ Copy `mongodb_atlas_manager.py` to backend
6. ✅ Update `saas_endpoints.py`
7. ✅ Test hospital signup
8. ✅ Verify in Atlas dashboard

**Then every hospital signup will automatically create their own Atlas database!** 🎉

---

## Example Workflow

```
Hospital Admin → Fills signup form → Selects plan → Pays (dummy)
    ↓
Backend:
  - Stores hospital info in master DB
  - Calls MongoDB Atlas API
  - Creates cluster with hospital name
  - Creates database user
  - Gets connection string
    ↓
Hospital Admin sees:
  - "✓ Cluster created: test-hospital"
  - "✓ Database: hospital_test_hospital"
  - Connection credentials
  - Ready to use!
    ↓
Hospital Staff:
  - Login with staff credentials
  - Connect to THEIR hospital's database
  - Only see THEIR hospital's patients
  - Complete data isolation! ✅
```

---

**Your hospitals now have enterprise-grade cloud databases! ☁️**
