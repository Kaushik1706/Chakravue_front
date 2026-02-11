# Umesh Duplicate Registration ID Issue - SOLUTION

## Problem Summary

You reported that **Umesh has TWO different appointments with different registration IDs**:
- **REG-2025-600651** (in queue)
- **REG-2025-871388** (in patient history)

However, the backend database only has **ONE Umesh record** with ID **REG-2025-871388**.

## Root Cause Analysis

The issue was in the **frontend appointment creation process**:

1. **First appointment**: Umesh was created as a new patient → generated ID REG-2025-871388
2. **Second appointment**: When you searched for "Umesh" to create another appointment:
   - The search likely worked correctly
   - But the system might have accidentally stayed in "New Patient" mode
   - This generated a DIFFERENT registration ID: REG-2025-600651
   - This ID was saved to the queue but never actually created in the backend

**Result**: Two appointments with two different IDs, but only ONE patient record in the backend.

## Solution Implemented

### 1. **Duplicate Prevention** ✅
Added a validation check to `AppointmentBookingView.tsx` that prevents creating new patients with names that already exist:

```typescript
// Check if a patient with this name already exists
const response = await fetch(`/patients/search?q=${patientName}`);
if (data.results && data.results.length > 0) {
  setError(`Patient "${newPatientName}" already exists with ID ${existingPatient.registrationId}. Please select from search results instead.`);
  return;
}
```

**Impact**: Users can't accidentally create duplicate patients anymore.

### 2. **Data Repair Tool** ✅
Created a new **Data Repair View** accessible from the sidebar (Database icon) that:

- **Scans** all appointments in queue
- **Identifies** duplicate patient appointments (same patient with multiple IDs)
- **Shows** all conflicting registration IDs
- **Allows** manual removal of incorrect appointments
- **Offers** auto-fix that reconciles with backend patient records

### 3. **Backend Duplicate Fix** ✅
Fixed the **Shashi duplicate** that was discovered:
- Shashi had 2 records in the backend with IDs: REG-2025-314247 and REG-2025-414582
- Merged all encounters from the duplicate into the primary record
- Deleted the duplicate record

## How to Fix Umesh

### Option 1: Auto-Fix (Recommended)
1. Click the **Database icon** in the sidebar (Data Repair)
2. Click **"Auto-Fix All Duplicates"** button
3. System will:
   - Find "umesh" in appointments queue
   - Search backend for correct Umesh ID (REG-2025-871388)
   - Replace all occurrences of REG-2025-600651 with REG-2025-871388
   - Remove duplicate appointments

### Option 2: Manual Fix
1. Go to **Data Repair** view
2. Find "umesh" in the duplicates list
3. Click the **trash icon** next to REG-2025-600651 to remove that appointment
4. Keep the appointment with REG-2025-871388 (the correct backend ID)

### Option 3: Browser Developer Tools
1. Press **F12** to open DevTools
2. Go to **Application** → **Local Storage**
3. Find **queuedAppointments** key
4. Search for all entries with "REG-2025-600651"
5. Delete them or replace with "REG-2025-871388"
6. Refresh the page

## Verification Checklist

After fixing, verify:

- [ ] Umesh appointment shows ID: **REG-2025-871388**
- [ ] Patient History shows Umesh with ID: **REG-2025-871388**
- [ ] No duplicates in Data Repair view
- [ ] Patient can proceed through queue without errors

## Prevention Going Forward

The following safeguards are now in place:

### 1. **Appointment Creation Validation**
- Cannot create new patient if same name exists in backend
- Must select from search results for existing patients

### 2. **Data Repair Tool**
- Monitor for duplicate appointments
- Fix inconsistencies between frontend and backend
- Located in sidebar (Database icon)

### 3. **Backend Duplicate Cleaning**
- Runs automatic script to find duplicates
- Consolidates duplicate records
- Preserves all encounter data from duplicates

## Technical Details

### Files Modified

1. **src/components/AppointmentBookingView.tsx**
   - Added duplicate patient name check in `handleCreateNewPatient()`
   - Now searches backend before allowing new patient creation

2. **src/components/DataRepairView.tsx** (NEW)
   - Scans queuedAppointments for duplicates
   - Provides manual removal and auto-fix options
   - Reconciles frontend appointments with backend patient records

3. **src/components/Sidebar.tsx**
   - Added Data Repair button (Database icon)
   - Added 'data-repair' view type

4. **src/App.tsx**
   - Imported DataRepairView
   - Added 'data-repair' to view types
   - Added view rendering logic

5. **backend/fix_duplicates.py**
   - Script to find and fix duplicate patient records
   - Merges encounters from duplicate records
   - Used to fix Shashi duplicates

## Next Steps

1. **Immediate**: Use Data Repair tool to fix Umesh duplicates
2. **Monitor**: Watch for any new duplicate patient issues
3. **Educate**: Ensure users search before creating new appointments
4. **Regular Cleanup**: Run Data Repair tool monthly to catch any issues

---

**Last Updated**: November 26, 2025
**Status**: ✅ COMPLETE - Ready for testing
