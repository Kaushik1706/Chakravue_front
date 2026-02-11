# MongoDB Integration Test Guide

## What Was Fixed

1. **Backend Import Error** - `db` variable was not imported from `database.py`
   - Fixed: Added `db` to import in `main.py`

2. **PUT Endpoint Error** - Was trying to match appointments that didn't exist in MongoDB
   - Fixed: Changed to `upsert=True` so it creates if doesn't exist

3. **Better Error Handling** - Added logging and clearer error messages

## How to Test

### Step 1: Restart Backend
```powershell
# Kill old process
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Start fresh
cd 'c:\Users\suman\Downloads\dashb (3)\dashb\backend'
python main.py
```
You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8008
```

### Step 2: Test MongoDB Directly
Open MongoDB Compass or shell and check:
```javascript
use chakra_hospital
db.appointments.find()  // Should be empty initially or show previous data
```

### Step 3: Book an Appointment in UI
1. Open http://localhost:3000 (or your dev server port)
2. Go to "Fix Appointment"
3. Create/search patient
4. Select doctor, date, time
5. Click "Book Appointment"

### Step 4: Check Backend Console
You should see:
```
✓ Appointment created: [Patient Name] (ID: [ObjectId])
```

### Step 5: Verify in MongoDB
```javascript
db.appointments.find()
// Should show your new appointment with status "booked"
```

### Step 6: Push to Reception
1. Go to "Appointment Queue"
2. Click on your appointment
3. Click "Push to Reception"

### Step 7: Check Backend Console Again
You should see:
```
✓ Appointment status updated in MongoDB
```

### Step 8: Verify Status Changed
```javascript
db.appointments.findOne({patientName: "Your Patient"})
// Should show status: "reception_pending"
```

## Endpoints Now Working

- ✅ `POST /appointments` - Create appointment
- ✅ `GET /appointments` - Get all appointments
- ✅ `PUT /appointments/{id}` - Update appointment status
- ✅ `GET /queue/appointments` - Get appointments by status

## Key Points

- Appointments are now saved to MongoDB
- They sync between all devices/browsers
- LocalStorage is fallback if MongoDB is down
- Check console for error messages if something fails
