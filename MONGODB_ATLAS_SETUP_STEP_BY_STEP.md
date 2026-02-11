# MongoDB Atlas Setup - Step by Step

## Step 1: Create MongoDB Atlas Account

### What is MongoDB Atlas?
- Cloud database service by MongoDB
- Hosts your hospital databases
- Free tier available (512MB per database)
- Can upgrade later

### How to Create:

**1. Go to website:**
```
https://www.mongodb.com/cloud/atlas
```

**2. Click "Try Free"**

**3. Sign up with:**
- Email: Use your email
- Password: Create secure password
- Click "Create your Atlas account"

**4. Verify email:**
- Check your email inbox
- Click verification link
- Verify email

**5. Answer setup questions:**
- Where are you building? → Backend application
- What is your goal? → Store user data
- Click "Finish"

**6. You're in! Dashboard shows:**
```
Your Organization: [Your Name's Org]
Projects: (empty)
```

✅ **Account created!**

---

## Step 2: Create Organization & Project

### Create Organization (Skip if asked)
- If prompted, click "Create Organization"
- Name: "Hospital Network" (or your company name)
- Accept terms
- Continue

### Create Project

**1. Click "New Project"**

**2. Enter name:**
```
Project name: "Hospital Databases"
```

**3. Click "Create Project"**

**4. You see:**
```
Hospital Databases
├─ Clusters (empty)
├─ Access Manager
├─ Settings
└─ Other options
```

✅ **Project created!**

---

## Step 3: Create Organization ID & Project ID

### Get Organization ID

**1. In Dashboard, click your avatar (top right)**

**2. Click "Organization Settings"**

**3. Look for "Organization ID"**

```
Example: 507f1f77bcf86cd799439011
```

**4. Copy it and save somewhere:**
```
MONGODB_ATLAS_ORG_ID = 507f1f77bcf86cd799439011
```

### Get Project ID

**1. In Dashboard, click "Hospital Databases" project**

**2. Click "Settings"**

**3. Look for "Project ID"**

```
Example: 507f1f77bcf86cd799439012
```

**4. Copy it and save:**
```
MONGODB_ATLAS_PROJECT_ID = 507f1f77bcf86cd799439012
```

✅ **IDs saved!**

---

## Step 4: Create API Keys

### How to Get API Keys

**1. Go to "Organization Settings"**
- Click your avatar (top right)
- Click "Organization Settings"

**2. Click "Access Manager"**
- Left sidebar → "Access Manager"

**3. Click "API KEYS" tab**

**4. Click "Create API Key"**

**5. Fill details:**
```
API Key Name: "Hospital Signup"
```

**6. Select permissions:**
- Check: "Organization Member"
- Check: "Read Write"
- (These allow creating databases)

**7. Click "Create API Key"**

**8. You see:**
```
Public API Key: xxxxxxxxxxxxxxxxxxxxxx
Private API Key: xxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANT: Copy BOTH keys NOW!**
- You won't see Private Key again!
- Copy to notepad/text file

**9. Save them:**
```
MONGODB_ATLAS_PUBLIC_KEY = xxxxxxxxxxxxxxxxxxxxxx
MONGODB_ATLAS_PRIVATE_KEY = xxxxxxxxxxxxxxxxxxxxxx
```

✅ **API Keys created!**

---

## Step 5: Add Your IP to Whitelist

### Why Whitelist?
- Security: Only your IP can call APIs
- Prevents unauthorized access

### Add IP

**1. In API Keys page, you see:**
```
"Add an IP Address to your API Whitelist"
```

**2. Click the text or "Edit Whitelist"**

**3. Click "Add IP Address"**

**4. Choose:**
```
☐ Specific IP address
☑ Allow access from anywhere (0.0.0.0)
```

**5. For now, select "0.0.0.0"**
- (Testing only, not production!)
- Click "Confirm"

✅ **IP Whitelist added!**

---

## Step 6: Create .env File

### Create File

**1. Open VS Code**

**2. Open your workspace:**
```
c:\Users\suman\Downloads\dashb (3)\dashb
```

**3. Create new file:**
- Right-click on "backend" folder
- Click "New File"
- Name it: `.env`

**4. Add these lines:**

```
MONGODB_ATLAS_PUBLIC_KEY=your_public_key_here
MONGODB_ATLAS_PRIVATE_KEY=your_private_key_here
MONGODB_ATLAS_ORG_ID=your_org_id_here
MONGODB_ATLAS_PROJECT_ID=your_project_id_here
```

**5. Replace with YOUR values:**

```
Example:
MONGODB_ATLAS_PUBLIC_KEY=public_abc123def456
MONGODB_ATLAS_PRIVATE_KEY=private_xyz789uvw012
MONGODB_ATLAS_ORG_ID=507f1f77bcf86cd799439011
MONGODB_ATLAS_PROJECT_ID=507f1f77bcf86cd799439012
```

**6. Save file:**
- Ctrl + S

✅ **.env file created!**

---

## Step 7: Verify Setup

### Check All Values

```
backend/.env should have:
✓ MONGODB_ATLAS_PUBLIC_KEY = [your public key]
✓ MONGODB_ATLAS_PRIVATE_KEY = [your private key]
✓ MONGODB_ATLAS_ORG_ID = [your org id]
✓ MONGODB_ATLAS_PROJECT_ID = [your project id]
```

### Check File Location

```
Your workspace:
dashb/
└── backend/
    ├── .env ✓ (should be here)
    ├── main.py
    ├── saas_endpoints.py
    ├── mongodb_atlas_manager.py
    └── models.py
```

### Test Connection

**1. Open terminal:**
```
Terminal → New Terminal
```

**2. Go to backend:**
```
cd backend
```

**3. Test if packages installed:**
```
pip install requests python-dotenv pymongo
```

**4. Test import:**
```
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('✓ .env loaded'); print('Public Key:', os.getenv('MONGODB_ATLAS_PUBLIC_KEY')[:10]+'...')"
```

**Expected output:**
```
✓ .env loaded
Public Key: public_abc123...
```

✅ **.env working!**

---

## Summary Checklist

```
☐ Created MongoDB Atlas account
☐ Created Organization  
☐ Created Project
☐ Copied Organization ID
☐ Copied Project ID
☐ Created API Key
☐ Copied Public Key
☐ Copied Private Key
☐ Added IP to whitelist
☐ Created backend/.env file
☐ Added all 4 values to .env
☐ Saved .env file
☐ Verified keys work
```

---

## What You Have Now

```
✅ MongoDB Atlas Account (active)
✅ API Keys (in .env file)
✅ Organization ID (in .env file)
✅ Project ID (in .env file)
✅ Ready to create hospital databases
```

---

## Next Steps

After you complete this setup:

1. Reply here saying "✅ MongoDB Atlas setup complete, all 4 keys in .env"
2. I'll implement the admin panel immediately
3. We'll test hospital signup
4. Hospital databases auto-create on MongoDB Atlas

---

## Common Issues

### "API Key not showing?"
- Make sure you copied it immediately after creation
- If you missed it, go back to Access Manager
- Delete old key, create new one

### ".env file not saving?"
- Make sure it's in `backend/` folder
- Not `backend/backend/` 
- Check file name is exactly `.env`

### "Import error: dotenv?"
- Run: `pip install python-dotenv`

### "Can't find Organization ID?"
- Go to your avatar → Organization Settings
- Scroll down to find it
- Copy the entire ID

---

## When You're Done

**Tell me:**
```
✅ MongoDB Atlas setup complete!
API Keys in .env ready!
```

**Then I'll:**
1. Add 8 admin endpoints to backend
2. Create admin dashboard component  
3. Test everything
4. You're ready to deploy! 🚀
```
