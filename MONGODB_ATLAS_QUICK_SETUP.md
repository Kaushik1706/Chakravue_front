# MongoDB Atlas Integration - Quick Setup (15 minutes)

## What This Does

When hospital signs up and pays:
```
Hospital Pays (Dummy Card)
    ↓
Backend calls MongoDB Atlas API
    ↓
Creates cloud database with hospital name
    ↓
Stores connection details
    ↓
Hospital gets credentials
    ↓
Hospital staff can login to THEIR database
    ↓
✅ Ready to use!
```

---

## Quick Setup (15 minutes)

### Step 1: MongoDB Atlas Account (5 min)
```
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create Organization
4. Create Project
5. Note: ORG_ID and PROJECT_ID
```

### Step 2: Get API Keys (3 min)
```
1. Organization Settings → Access Manager
2. Create API Key
3. Save:
   - PUBLIC_KEY
   - PRIVATE_KEY
4. Add your IP to whitelist
```

### Step 3: Set Environment Variables (2 min)
Create `.env` file in `backend/` folder:
```
MONGODB_ATLAS_PUBLIC_KEY=your_public_key
MONGODB_ATLAS_PRIVATE_KEY=your_private_key
MONGODB_ATLAS_ORG_ID=your_org_id
MONGODB_ATLAS_PROJECT_ID=your_project_id
```

### Step 4: Install Package (1 min)
```bash
pip install requests
```

### Step 5: Copy Files (2 min)
Files already created:
- ✅ `backend/mongodb_atlas_manager.py` (ready to use)
- ✅ `MONGODB_ATLAS_SETUP.md` (full guide)

### Step 6: Update Backend (2 min)
Edit `backend/saas_endpoints.py`:

Find this section:
```python
@router.post("/process-payment")
async def process_payment(payment: PaymentDetails):
```

Replace with the code from **MONGODB_ATLAS_SETUP.md** section "Step 5.2"

---

## Test It

### 1. Start your app
```bash
# Terminal 1
npm run dev

# Terminal 2
uvicorn main:app --reload --port 8008
```

### 2. Create a hospital
- Click 💳 **Create Hospital**
- Name: "Test Hospital"
- Email: "test@hospital.com"
- Plan: Professional
- Card: 4111111111111111

### 3. Watch for success message
```
✓ Database created on MongoDB Atlas!
Cluster: test-hospital
Database: hospital_test_hospital
Connection string: mongodb+srv://...
```

### 4. Verify in MongoDB Atlas
- Go to https://cloud.mongodb.com/v2
- Your Project → Clusters
- You should see: **test-hospital** cluster
- ✅ Success!

---

## Your Hospital Gets

After signup:

✅ Own MongoDB Atlas cluster
✅ Own cloud database (hospital_name)
✅ Username & password
✅ Connection string
✅ 512MB free storage
✅ Can upgrade tier anytime

---

## Cost

- **Free tier (M0):** $0 forever
- **M2 tier:** $9/month (if they upgrade)
- **M5 tier:** $57/month (if they upgrade)
- Start free, upgrade anytime!

---

## Files Involved

| File | Status | What It Does |
|------|--------|-------------|
| `mongodb_atlas_manager.py` | ✅ Created | Connects to Atlas API |
| `saas_endpoints.py` | 📝 Update needed | Call Atlas manager |
| `MONGODB_ATLAS_SETUP.md` | ✅ Created | Full setup guide |
| `.env` | 🔧 Create | Store API keys |

---

## Next Steps

1. Create MongoDB Atlas account
2. Get API keys
3. Create `.env` file
4. Install requests: `pip install requests`
5. Update `saas_endpoints.py` with code from setup guide
6. Test hospital signup
7. Watch hospital get cloud database! 🎉

---

**Everything else is already done! Just need these 5 steps!** ✅
