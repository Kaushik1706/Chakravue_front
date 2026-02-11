# Patient Queue Workflow System

## Overview
Complete multi-stage patient workflow from appointment booking through discharge, with automatic data propagation between stages.

## Workflow Stages

### 1. **Appointment Booking** (`AppointmentBookingView`)
- Create new patient or search existing
- Select doctor and appointment date/time
- Prevent double-booking with conflict detection
- Auto-generates registration IDs: `REG-YYYY-XXXXXX`
- Status: `booked`
- **Navigation**: Header button "Fix Appointment" or Sidebar → Calendar icon

### 2. **Appointment Queue** (`AppointmentQueueView`)
- View all booked appointments
- Filter by tabs: All / Booked / Pending
- Status: `booked` → `reception_pending`
- Action: "Push to Reception"
- Data propagated to reception queue
- **Navigation**: Sidebar → Layers icon or Header "Appointment Queue"

### 3. **Reception Queue** (`ReceptionQueueView`)
- Reception desk receives patients
- Check-in form with phone verification
- Add notes/observations about patient condition
- Status: `reception_pending` → `reception_completed`
- Action: "Complete & Send to OPD"
- Auto-fills OPD form with reception notes
- **Navigation**: Sidebar → User icon (Reception) or Header "Reception Queue"

### 4. **OPD Queue** (`OpdQueueView`)
- OPD technician examines patient
- Auto-populated from reception data:
  - Patient name, registration ID, doctor assigned
  - Reception notes displayed (auto-fill)
- Enter OPD findings (vision, IOP, investigations)
- Status: `opd_pending` → `opd_completed`
- Action: "Complete & Send to Doctor"
- Auto-fills doctor form with OPD findings
- **Navigation**: Sidebar → Eye icon or Header "OPD Queue"

### 5. **Doctor Queue** (`DoctorQueueView`)
- Doctor consultation
- Auto-populated from OPD data:
  - Patient info, appointment details
  - OPD findings displayed
- Enter diagnosis and prescription
- Status: `doctor_pending` → `discharged`
- Action: "Complete & Discharge"
- Patient marked as discharged
- **Navigation**: Sidebar → Stethoscope icon or Header "Doctor Queue"

## Data Model

### QueuedPatient Interface
```typescript
interface QueuedPatient {
  _id: string;
  patientName: string;
  patientRegistrationId: string;
  patientAge: string;
  patientSex: string;
  patientPhone: string;
  patientEmail: string;
  
  // Appointment Details
  appointmentDate: string;
  appointmentTime: string;
  doctorId: string;
  doctorName: string;
  
  // Status & Tracking
  status: AppointmentStatus;
  queuePosition: number;
  
  // Timestamps
  bookedAt: string;
  receivedByReceptionAt?: string;
  completedByReceptionAt?: string;
  receivedByOpdAt?: string;
  completedByOpdAt?: string;
  receivedByDoctorAt?: string;
  completedByDoctorAt?: string;
  
  // Auto-fill Data
  receptionNotes?: string;
  opdFindings?: any;
  doctorFindings?: {
    diagnosis: string;
    prescription: string;
  };
}
```

### AppointmentStatus Type
```typescript
type AppointmentStatus = 
  | 'booked'
  | 'reception_pending'
  | 'reception_completed'
  | 'opd_pending'
  | 'opd_completed'
  | 'doctor_pending'
  | 'discharged';
```

## Storage
- **Current**: localStorage (mock implementation)
  - `queuedAppointments`: Main appointment list
  - `appointmentQueue`: Appointments ready for reception
  - `receptionQueue`: Patients checked in, waiting for OPD
  - `opdQueue`: Patients examined, waiting for doctor
  - `doctorQueue`: Patients waiting for doctor consultation

- **Future**: Backend API endpoints
  - `GET /appointments` - Fetch all appointments
  - `GET /queue/{queueName}` - Fetch specific queue
  - `PUT /queue/update-status/{patientId}` - Update patient status and move between queues

## UI Features

### Common Elements Across All Queues
- Queue position badges (1, 2, 3...)
- Status indicators with color coding
- Patient details panel on right
- Real-time queue list updates
- Sticky form panel for data entry
- Status-specific fields auto-populated from previous stage

### Professional Design
- Dark theme: `#0a0a0a` background
- Gold accent: `#D4A574`
- Responsive grid layouts
- Lucide icons for actions
- Smooth transitions and hover states
- Professional typography (light font weights)

## Workflow Guarantees

✅ **Data Preservation**: All data from previous stages auto-filled
✅ **Sequential Processing**: Patient cannot skip stages
✅ **One-Step Transitions**: Each stage handles single responsibility
✅ **Role-Based Access**: Each queue targets specific role
✅ **Real-time Updates**: Queue changes reflect immediately
✅ **No Data Loss**: Complete audit trail with timestamps
✅ **Queue Position Tracking**: Clear ordering and priority

## Testing the Workflow

1. **Create Appointment**:
   - Go to "Fix Appointment" → Create new patient → Book appointment
   - Patient appears in Appointment Queue

2. **Push to Reception**:
   - Go to Appointment Queue → Select patient → "Push to Reception"
   - Patient moves to Reception Queue

3. **Reception Check-in**:
   - Go to Reception Queue → Select patient → Add notes → "Complete & Send to OPD"
   - Notes auto-fill in OPD form

4. **OPD Examination**:
   - Go to OPD Queue → Verify notes auto-filled → Add findings → "Complete & Send to Doctor"
   - Findings auto-fill in Doctor form

5. **Doctor Consultation**:
   - Go to Doctor Queue → Verify findings auto-filled → Add diagnosis/prescription → "Complete & Discharge"
   - Patient marked as discharged

## Navigation Quick Links

| Role | Sidebar Icons | Header Buttons |
|------|---------------|----------------|
| Administrator | All queues visible | All buttons visible |
| Reception | User icon + other queues | Reception Queue button |
| OPD | Eye icon + other queues | OPD Queue button |
| Doctor | Stethoscope icon + others | Doctor Queue button |

## Future Enhancements

- [ ] Real-time WebSocket updates for multi-user access
- [ ] Backend API endpoints for persistence
- [ ] Role-based queue visibility (auto-filter to relevant queues)
- [ ] Queue metrics dashboard (wait times, throughput)
- [ ] Patient notifications at each stage
- [ ] Digital prescriptions and follow-up scheduling
- [ ] Queue analytics and performance metrics
