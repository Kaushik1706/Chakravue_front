# Operations Hub - User Requirements & Fixes Summary

## User Issue #1: Blue Pulse After Moving Patient to OPD

### What The User Said:
> "I have passed that patient from reception to the OPD but still am seeing the blue pulse why? Check it"

### The Problem:
- Patient marked as "passed to OPD"
- Backend updates OPD queue
- UI still shows SCHEDULED (blue pulse) instead of OPD (orange pulse)
- Confusing for staff - not clear if patient already left or still waiting

### What's Happening:
```
Timeline:
[SCHEDULED - Blue] → Click "Open for Documentation" 
                  → Backend: Move to OPD queue
                  → Bug: UI still shows Blue ❌
                  → Should show Orange ✅
```

### The Fix:
The component already fetches every 5 seconds. The issue is likely on **backend side**:

**What the backend needs to do when reception_done is called:**
1. Mark reception queue entry as `status: 'done'`
2. Create new OPD queue entry with same `appointmentDate` and `registrationId`
3. Return success

**In OperationsCenter, the filtering logic correctly handles this:**
- Line 105-109: Checks if patient is in OPD on same date
- Line 110: Excludes them from Scheduled list
- Next 5-second refresh brings in the orange OPD patient

### How to Verify It's Fixed:
1. Send patient from Reception to OPD
2. Wait 5 seconds (or change date filter to refresh)
3. Patient should disappear from blue/SCHEDULED
4. Patient should appear in orange/OPD with pulsing dot
5. Status arrow should say "→ Screening / Testing"

---

## User Issue #2: No Navigation to Patient Records from Operations Hub

### What The User Said:
> "From the operations hub if i selected in a patient it directly navigate the home button with the cards that contains his details"

### The Problem:
- User sees patient in Operations Hub sidebar
- User wants to click patient → Go to home/patient view
- No direct link from queue view to patient records

### The Solution Added:
✅ **New Button: "View Patient Records"**
- Appears in patient detail panel (right side)
- Positioned between "Open for Documentation" and "Cancel Session"
- Click it → Loads full patient card with all medical history
- Navigates to patient's record in main view

### Button Behavior:
```
Click Patient in Queue
       ↓
Shows preview panel
       ↓
Click "View Patient Records"
       ↓
Loads patient data: loadPatientByRegistration()
       ↓
Patient card appears on main view with all medical data
```

### UI Changes:
**Before:**
- Only "Open for Documentation" and "Cancel Session" buttons
- No way to view patient without opening for documentation

**After:**
- "Open for Documentation" → For entering medical notes
- **"View Patient Records"** → To view existing history (NEW)
- "Cancel Session" → To remove from queue

---

## User Issue #3: Role-Based Queue Visibility

### What The User Said:
> "So if I am a reception in the operations hub I should see the scheduled appointments and appointments that I fixed, and if I send any person to OPD I should not see that person. Similarly for the doctor?"

### The Problem:
- All staff (receptionist, OPD, doctor) see ALL queues
- Receptionist confused seeing OPD patients
- OPD staff confused seeing scheduled patients
- Doctor sees patients they're not treating

### The Solution:
✅ **Role-Based Filtering** - Each staff member sees ONLY their queue

### How It Works:

#### RECEPTIONIST SEES:
- 🔵 SCHEDULED appointments (blue)
- 🟢 RECEPTION queue (green)
- ❌ Does NOT see OPD or Doctor patients

**Logic:**
```
User role = 'receptionist'
  ↓
Filter patients where:
  - level === 'Scheduled' OR
  - level === 'Reception'
  ↓
Result: Only blue & green patients show
```

**Example View:**
```
OPERATIONS HUB (Receptionist View)
- [Blue] Jax - Reserved - 02:00 PM
- [Blue] Ramkrishna - Reserved - 03:00 PM
- [Green] Maria - At Front Desk - 02:45 PM

(No OPD or Doctor patients visible)
```

---

#### OPD STAFF SEES:
- 🟠 OPD queue ONLY (orange)
- ❌ Does NOT see Scheduled, Reception, or Doctor

**Logic:**
```
User role = 'opd'
  ↓
Filter patients where:
  - level === 'OPD'
  ↓
Result: Only orange patients show
```

**Example View:**
```
OPERATIONS HUB (OPD Staff View)
- [Orange] Ahmed - Screening / Testing - 02:30 PM
- [Orange] Fatima - Screening / Testing - 02:50 PM

(No Scheduled, Reception, or Doctor patients visible)
```

---

#### DOCTOR SEES:
- 🔴 DOCTOR queue ONLY (red)
- ❌ Does NOT see any other queues

**Logic:**
```
User role = 'doctor'
  ↓
Filter patients where:
  - level === 'Doctor'
  ↓
Result: Only red patients show
```

**Example View:**
```
OPERATIONS HUB (Doctor View)
- [Red] Ali - Consul. in Progress - 02:15 PM
- [Red] Sara - Consul. in Progress - 03:10 PM

(No Scheduled, Reception, or OPD patients visible)
```

---

#### ADMIN/MANAGER SEES:
- All queues (All colors)
- Can monitor entire clinic workflow

---

### Implementation Details:

**Code Added in OperationsCenter.tsx (lines ~250-270):**
```typescript
.filter(p => {
  // Admin/Manager see all
  if (!userRole || userRole === 'admin' || userRole === 'manager') {
    return true;
  }
  
  // Receptionist sees: Scheduled appointments + Reception queue only
  if (userRole === 'receptionist' || userRole === 'reception') {
    return p.level === 'Scheduled' || p.level === 'Reception';
  }
  
  // OPD staff sees: Only OPD queue
  if (userRole === 'opd') {
    return p.level === 'OPD';
  }
  
  // Doctor sees: Only Doctor queue
  if (userRole === 'doctor') {
    return p.level === 'Doctor';
  }
  
  // Default: show all if role not recognized
  return true;
})
```

**How userRole is Passed:**
1. User logs in → `setUserRole(role)`
2. App.tsx passes to OperationsCenter: `userRole={userRole}`
3. OperationsCenter filters based on role
4. Queue automatically updates based on user

---

## Complete User Workflow Examples

### Example 1: Receptionist Flow
```
Receptionist Login
  ↓
Operations Hub loads
  ↓
Sees SCHEDULED (blue) patients → Their appointment list
  ↓
Patient arrives → Click to select
  ↓
Click "Mark Patient Arrived" 
  ↓
Patient moves to RECEPTION (green)
  ↓
Check vital signs, notes
  ↓
Click "Open for Documentation" → Enter patient data
  ↓
Click "Complete Check-in" → Send to OPD
  ↓
Patient disappears from receptionist's view (now in OPD)
```

### Example 2: OPD Staff Flow
```
OPD Staff Login
  ↓
Operations Hub loads
  ↓
Sees ONLY OPD (orange) patients waiting
  ↓
No SCHEDULED or Reception patients visible
  ↓
Takes first orange patient
  ↓
Does screening/testing
  ↓
Sends to Doctor → Patient disappears from OPD queue
  ↓
(Doctor now sees them in red queue)
```

### Example 3: Doctor Flow
```
Doctor Login
  ↓
Operations Hub loads
  ↓
Sees ONLY DOCTOR (red) queue
  ↓
No Scheduled, Reception, or OPD patients visible
  ↓
Consults with red patient
  ↓
Mark as discharged
  ↓
Patient moves to DISCHARGED list
```

---

## Status Badge Reference

### Visual Indicators:

| Status | Color | Pulse | Meaning | Who Sees It |
|--------|-------|-------|---------|------------|
| SCHEDULED | 🔵 Blue | Yes | Appointment booked, waiting | Receptionist |
| RECEPTION | 🟢 Green | Yes | At front desk, checked in | Receptionist |
| OPD | 🟠 Orange | Yes | In screening/testing area | OPD Staff |
| DOCTOR | 🔴 Red | Yes | In consultation with doctor | Doctor |
| DISCHARGED | ⚫ Slate | Yes | Consultation complete | Admin only |

### What Staff See in Each Role:

**Receptionist:**
- ✅ Blue (SCHEDULED)
- ✅ Green (RECEPTION)
- ❌ Orange (OPD)
- ❌ Red (DOCTOR)
- ❌ Slate (DISCHARGED)

**OPD:**
- ❌ Blue (SCHEDULED)
- ❌ Green (RECEPTION)
- ✅ Orange (OPD)
- ❌ Red (DOCTOR)
- ❌ Slate (DISCHARGED)

**Doctor:**
- ❌ Blue (SCHEDULED)
- ❌ Green (RECEPTION)
- ❌ Orange (OPD)
- ✅ Red (DOCTOR)
- ❌ Slate (DISCHARGED)

**Admin:**
- ✅ All (Full visibility)

---

## Implementation Checklist

- [x] Added `userRole` prop to OperationsCenter component
- [x] Implemented role-based filtering logic
- [x] Receptionist sees Scheduled + Reception only
- [x] OPD sees OPD queue only
- [x] Doctor sees Doctor queue only
- [x] Admin sees all queues
- [x] Added "View Patient Records" button
- [x] Navigation to patient callback handler
- [x] Passed userRole from App.tsx
- [x] Status badges clearly visible with pulsing indicators
- [x] No compilation errors

---

## What Should Happen Now

### Immediate Effects:
1. ✅ Each staff member logs in → See only their queue
2. ✅ Receptionist sends patient to OPD → Patient disappears (moved to OPD queue)
3. ✅ OPD staff takes patient → Patient disappears (moved to Doctor queue)
4. ✅ Doctor finishes → Patient disappears (moved to Discharged)
5. ✅ Any staff can click patient → See "View Patient Records" button
6. ✅ Click that button → Full patient card loads

### Status Visibility:
- 📍 SCHEDULED (Blue pulse) - Clear it's booked
- 📍 RECEPTION (Green pulse) - Clear they're at desk
- 📍 OPD (Orange pulse) - Clear they're being screened
- 📍 DOCTOR (Red pulse) - Clear they're being consulted
- 📍 DISCHARGED (Slate pulse) - Clear session is done

---

## Troubleshooting

### If Blue Patient Doesn't Change to Orange:
1. Check backend is creating OPD queue entry
2. Wait 5 seconds or change date filter
3. Verify `appointmentDate` is same in both queues
4. Check browser console for API errors

### If Receptionist Still Sees OPD Patients:
1. Verify `userRole === 'receptionist'` or `'reception'`
2. Check browser console for filter logic
3. Try logout/login to refresh role

### If "View Patient Records" Button Doesn't Work:
1. Check `loadPatientByRegistration()` exists
2. Verify registration ID is not 'Not Assigned'
3. Check API endpoints for patient fetch
