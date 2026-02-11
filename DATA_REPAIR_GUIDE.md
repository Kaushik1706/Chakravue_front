# Data Repair Tool - Quick Guide

## What is the Data Repair Tool?

A maintenance utility to find and fix duplicate patient appointments in your system. It helps ensure that:
- Each patient has only ONE registration ID
- Appointments are properly linked to the correct patient record
- Frontend appointments match backend patient records

## Where to Find It

1. Look at the **left sidebar** (vertical navigation)
2. Click the **Database icon** (looks like a database/cylinder icon)
3. You'll see the **Data Repair & Maintenance** view

## How to Use It

### If You See Duplicates

When you open the Data Repair view, you'll see a list like:

```
Found 1 Patient(s) with Multiple IDs

umesh
├── REG-2025-600651 (WRONG - doesn't exist in backend)
└── REG-2025-871388 (CORRECT - from backend)
```

### Option 1: Quick Auto-Fix (RECOMMENDED)

1. Click **"Auto-Fix All Duplicates"** button
2. System will:
   - Search backend for correct patient IDs
   - Replace wrong IDs with correct ones
   - Remove duplicate appointments
3. See success message ✅

This is the fastest way - takes ~2 seconds.

### Option 2: Manual Fix

1. For each wrong ID, click the **trash icon** 🗑️
2. Confirm removal
3. This deletes that appointment
4. Repeat for each wrong ID

Use this if you want to be selective about which duplicates to remove.

### Option 3: Do Nothing

If you have no duplicates (green checkmark):

```
✓ No Duplicates Found
Your appointment data is clean and consistent.
```

Just close the view - no action needed.

## What Gets Fixed?

The Data Repair tool fixes:

✅ **Appointment Registration IDs** - Replaces wrong IDs with correct backend IDs
✅ **Duplicate Appointments** - Removes multiple appointments for same patient/date
✅ **Frontend-Backend Sync** - Ensures appointments match actual patient records

It does NOT:

❌ Modify actual patient data in backend
❌ Delete patient records
❌ Delete other queue data
❌ Affect patient history

## When to Use It

**Use regularly:**
- Monthly maintenance
- After experiencing duplicate appointment issues
- After importing patient data
- After bulk operations

**Use immediately if:**
- You see multiple IDs for same patient
- Appointments aren't appearing correctly
- Getting "Patient not found" errors

## Troubleshooting

**Q: Auto-fix didn't work?**
A: Check your backend connection:
   - Make sure backend is running (`uvicorn`)
   - Backend should be at `http://127.0.0.1:8008`
   - Try manual fix instead

**Q: It says "Auto-fix failed" with errors?**
A: Check the error message:
   - If it's a connection error → start backend
   - If it's a search error → patient might have unusual characters in name
   - Try manual deletion of wrong ID

**Q: Can I undo an auto-fix?**
A: No - it modifies localStorage directly
   - But data in backend is unchanged
   - You can manually fix again if needed

**Q: Should I back up data first?**
A: Your data is safe:
   - Auto-fix only updates localStorage (frontend)
   - Backend data is unchanged
   - You can always reload data from backend

## Example Walkthrough

### Scenario: Umesh with 2 IDs

1. **Before:**
   - Queue shows: Umesh (REG-2025-600651)
   - History shows: Umesh (REG-2025-871388)
   - Backend has: Only REG-2025-871388

2. **Open Data Repair:**
   - See "umesh" with 2 IDs
   - Shows REG-2025-600651 and REG-2025-871388

3. **Click Auto-Fix:**
   - "Searching backend..."
   - "Found correct ID: REG-2025-871388"
   - "Fixed 1 patients"
   - Success! ✅

4. **After:**
   - Queue shows: Umesh (REG-2025-871388)
   - History shows: Umesh (REG-2025-871388)
   - Backend has: REG-2025-871388
   - All consistent! ✅

## Accessing from Code

If you need to access the repair tool programmatically:

```typescript
// Open Data Repair view
setCurrentView('data-repair');

// Or from browser console:
localStorage.getItem('queuedAppointments') // View appointments
```

## Prevention Tips

To avoid duplicates in the future:

1. **Always search first** - When creating appointments, search for patient before clicking "Create New Patient"
2. **Use the new validation** - System now prevents creating patients with duplicate names
3. **Run monthly checks** - Use Data Repair tool to catch issues early
4. **Watch the error messages** - If you see "Patient already exists", use the found record

---

**Remember**: This tool is safe and non-destructive. It only updates frontend appointment data to match your backend patient records.
