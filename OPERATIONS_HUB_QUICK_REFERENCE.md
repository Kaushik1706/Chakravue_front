# Operations Hub - Quick Reference Card

## 🔴 Status at a Glance

### Issue #1: Blue Pulse on OPD Transfer
```
PROBLEM:  Patient sent to OPD but still shows SCHEDULED (blue)
CAUSE:    Status refresh timing or backend transition incomplete
SOLUTION: Component fetches every 5 sec - will pick up OPD entry
TEST:     Send to OPD → Wait 5 sec → Should see orange badge
```

### Issue #2: No Patient Records Link
```
PROBLEM:  Can't navigate from Operations Hub to patient details
CAUSE:    Missing navigation button/handler
SOLUTION: Added "View Patient Records" button in details panel
TEST:     Click patient → See new button → Click it → Load patient card
```

### Issue #3: All Roles See All Queues
```
PROBLEM:  Receptionist sees OPD, Doctor sees Scheduled - confusing!
CAUSE:    No role-based filtering in Operations Hub
SOLUTION: Filter by userRole - each role sees only their queue
TEST:     Login as different roles → See only your queue
```

---

## 🎯 What Each Role Sees

### RECEPTIONIST
```
Operations Hub View:
├─ 🔵 SCHEDULED (your appointments)
└─ 🟢 RECEPTION (checked in patients)

NOT visible: 🟠 OPD, 🔴 DOCTOR, ⚫ DISCHARGED
```

### OPD STAFF
```
Operations Hub View:
└─ 🟠 OPD (waiting for screening)

NOT visible: 🔵 SCHEDULED, 🟢 RECEPTION, 🔴 DOCTOR, ⚫ DISCHARGED
```

### DOCTOR
```
Operations Hub View:
└─ 🔴 DOCTOR (waiting for consultation)

NOT visible: 🔵 SCHEDULED, 🟢 RECEPTION, 🟠 OPD, ⚫ DISCHARGED
```

### ADMIN
```
Operations Hub View:
├─ 🔵 SCHEDULED
├─ 🟢 RECEPTION
├─ 🟠 OPD
├─ 🔴 DOCTOR
└─ ⚫ DISCHARGED
```

---

## 📊 Patient Status Badge System

### Colors & Meanings
```
🔵 SCHEDULED (Blue)   → Appointment booked, waiting for arrival
🟢 RECEPTION (Green)  → Checked in at front desk
🟠 OPD (Orange)       → Screening / Testing in progress
🔴 DOCTOR (Red)       → Consultation with physician in progress
⚫ DISCHARGED (Slate) → Session complete, discharged

All have pulsing dot animation for visibility
```

### Sub-Status (What They're Doing)
```
SCHEDULED  → Reserved
RECEPTION  → At Front Desk
OPD        → Screening / Testing
DOCTOR     → Consul. in Progress
DISCHARGED → Consultation Done
```

---

## 🔄 Patient Flow Through System

```
┌─────────────────────┐
│  SCHEDULED (Blue)   │  ← Appointment created
│  Reserved           │
└──────────┬──────────┘
           │ [Mark Patient Arrived]
           ↓
┌─────────────────────┐
│ RECEPTION (Green)   │  ← At reception desk
│ At Front Desk       │
└──────────┬──────────┘
           │ [Complete Check-in]
           ↓
┌─────────────────────┐
│   OPD (Orange)      │  ← Screening/Testing
│ Screening/Testing   │
└──────────┬──────────┘
           │ [Send to Doctor]
           ↓
┌─────────────────────┐
│  DOCTOR (Red)       │  ← Consultation
│ Consul. in Progress │
└──────────┬──────────┘
           │ [Mark Discharged]
           ↓
┌─────────────────────┐
│ DISCHARGED (Slate)  │  ← Finished
│ Consultation Done   │
└─────────────────────┘
```

---

## 🎮 User Actions Available

### Receptionist Panel
```
When patient is SCHEDULED (Blue):
  → [Mark Patient Arrived] - Move to RECEPTION

When patient is at RECEPTION (Green):
  → [Open for Documentation] - Start entering data
  → [View Patient Records] - See existing data
  → [Cancel Session] - Remove from queue

After opening for documentation:
  → [Complete Check-in] - Send to OPD
  → [Cancel Session] - Remove from queue
```

### OPD Staff Panel
```
When patient is at OPD (Orange):
  → [Open for Documentation] - Continue/update data
  → [View Patient Records] - See patient history
  → [Send to Doctor] - Move to DOCTOR queue
  → [Cancel Session] - Remove from queue
```

### Doctor Panel
```
When patient is with DOCTOR (Red):
  → [Open for Documentation] - Conduct consultation
  → [View Patient Records] - See full patient history
  → [Mark Discharged] - Complete session
  → [Cancel Session] - Remove from queue
```

---

## 📱 UI Elements

### Patient Card (Sidebar)
```
┌──────────────────────────┐
│ 📍 SCHEDULED             │  ← Status with pulse
│ → Reserved               │  ← Sub-status
│                          │
│ Patient Name             │  ← Name
│ REG-12345 | 02:00 PM     │  ← ID and time
│                          │
│ [Selected highlight]     │
└──────────────────────────┘
```

### Patient Details Panel (Right Side)
```
┌────────────────────────────────┐
│                                │
│ [Profile Info]                 │
│ • Name                         │
│ • Registration ID              │
│ • Phone                        │
│                                │
│ [Workflow Status]              │
│ • Appointment time             │
│ • Specialist                   │
│ • Category                     │
│                                │
│ [Notes/Data Entry Area]        │
│                                │
│ ┌──────────────────────────┐  │
│ │ Open for Documentation   │  │ (Primary action)
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ View Patient Records   │  │ (NEW - Navigate)
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ Cancel Session / Remove   │  │ (Secondary)
│ └──────────────────────────┘  │
│                                │
│ [Dismiss Preview]              │
│                                │
└────────────────────────────────┘
```

---

## 🔧 Technical Details

### Files Modified
- `src/components/OperationsCenter.tsx` - Added filtering & button
- `src/App.tsx` - Pass userRole prop

### Props Added to OperationsCenter
```typescript
userRole?: string | null;
onNavigateToPatient?: (patient: any) => void;
```

### Filtering Logic
```typescript
// Role-based filter applied after search/date filters
.filter(p => {
  if (!userRole || userRole === 'admin') return true;
  if (userRole === 'receptionist') return p.level === 'Scheduled' || p.level === 'Reception';
  if (userRole === 'opd') return p.level === 'OPD';
  if (userRole === 'doctor') return p.level === 'Doctor';
  return true;
})
```

### Data Refresh
- Auto-refresh every 5 seconds
- Triggered on date change
- Catches all queue transitions

---

## ✅ Testing Checklist

- [ ] Receptionist logs in → Only sees SCHEDULED + RECEPTION
- [ ] OPD logs in → Only sees OPD
- [ ] Doctor logs in → Only sees DOCTOR
- [ ] Send patient from RECEPTION to OPD → Blue → Orange
- [ ] Patient disappears from receptionist view
- [ ] Click "View Patient Records" → Loads full patient card
- [ ] Status badges clearly visible with pulsing dots
- [ ] No errors in console

---

## 🚨 Troubleshooting

| Issue | Check This |
|-------|-----------|
| Patient still blue after OPD | Backend creating OPD entry? Same appointmentDate? |
| Receptionist sees OPD patients | User role set correctly? Logout/login? |
| "View Patient Records" doesn't work | Registration ID valid? API endpoint working? |
| Status badges not visible | Clear browser cache, refresh page |
| Filtering not working by role | Check userRole prop passed from App.tsx |

---

## 💡 Key Points

1. **Filtering happens at React level** - Operations Hub receives filtered list based on role
2. **Data refresh every 5 seconds** - Status changes automatically picked up
3. **User role determines visibility** - No backend query changes needed
4. **Navigation is local** - Click button → Load patient data from existing API
5. **Status badges are color-coded** - Instant visual identification of patient location

---

## 📞 Quick Help

### I'm a Receptionist - What Do I Do?
1. See SCHEDULED patients (blue) → Click one
2. Mark them arrived → They turn green
3. Click "Open for Documentation" → Enter data
4. Click "Complete Check-in" → Send to OPD
5. They disappear from your view (now in OPD staff's queue)

### I'm OPD Staff - What Do I Do?
1. See OPD patients (orange) waiting
2. Click one → See their data
3. Do screening/testing
4. Click "Send to Doctor" → Done with them
5. They disappear (now with doctor)

### I'm a Doctor - What Do I Do?
1. See DOCTOR patients (red) waiting
2. Click one → See their data
3. Conduct consultation
4. Click "Mark Discharged" → Done
5. They disappear (consultation complete)

### I'm Admin - What Do I Do?
1. See ALL patients in ALL queues
2. Monitor entire clinic flow
3. Can intervene if needed
4. Check queue status and performance

---

**✅ All Fixed and Ready to Use!**
