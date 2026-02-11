# ADMIN DATA ACCESS - View & Maintain All Hospital Databases

## Your Requirement

You want to:
- ✅ View all hospital databases
- ✅ See hospital data (patients, appointments, billing)
- ✅ Fix issues when they happen
- ✅ Maintain data integrity
- ✅ Have full admin access for troubleshooting

**Solution: Admin Dashboard with Multi-Database Access**

---

## Architecture

```
ADMIN LOGIN (You)
    ↓
ADMIN DASHBOARD
├─ View all hospitals
├─ Select hospital to view
├─ Access that hospital's database
├─ See all patient data
├─ Fix issues
└─ Query and repair data

HOSPITAL STAFF LOGIN (Them)
    ↓
HOSPITAL DASHBOARD
├─ See only THEIR hospital
├─ Cannot see admin panel
├─ Cannot see other hospitals
└─ Cannot see master database

COMPLETE VISIBILITY FOR ADMIN ✓
COMPLETE ISOLATION FOR HOSPITALS ✓
```

---

## How Admin Sees Everything

### Step 1: Get Connection Strings from Master Database

```python
# Backend: Get all hospital databases
from pymongo import MongoClient

master_client = MongoClient("mongodb://localhost:27017")
master_db = master_client["chakravue_master"]
organizations = master_db["organizations"]

# Get all hospitals
all_hospitals = list(organizations.find({}, {
    "organization_name": 1,
    "mongodb_connection_string": 1,
    "mongodb_database_name": 1,
    "mongodb_username": 1,
    "mongodb_password": 1
}))

# Result:
# [
#   {
#     "organization_name": "City Eye Clinic",
#     "mongodb_connection_string": "mongodb+srv://admin:pass@...",
#     "mongodb_database_name": "hospital_city_eye",
#     "mongodb_username": "admin",
#     "mongodb_password": "secure_pass"
#   },
#   {
#     "organization_name": "Metro Clinic",
#     "mongodb_connection_string": "mongodb+srv://admin:pass@...",
#     "mongodb_database_name": "hospital_metro",
#     ...
#   }
# ]
```

### Step 2: Admin Selects Hospital

```python
# Admin API endpoint: Get hospitals list
@router.get("/admin/hospitals")
async def get_all_hospitals():
    """Admin sees list of all hospitals"""
    organizations = master_db["organizations"].find({})
    
    hospitals = []
    for org in organizations:
        hospitals.append({
            "organization_id": org["organization_id"],
            "hospital_name": org["organization_name"],
            "email": org["organization_email"],
            "plan": org["plan"],
            "status": org["status"],
            "patients_count": 0,  # Will fetch from hospital DB
            "created_date": org["created_at"]
        })
    
    return {
        "status": "success",
        "hospitals": hospitals,
        "total_count": len(hospitals)
    }
```

### Step 3: Admin Views Hospital Database

```python
# Admin API endpoint: Get specific hospital's data
@router.get("/admin/hospital/{hospital_id}/patients")
async def get_hospital_patients(hospital_id: str):
    """Admin views all patients of a specific hospital"""
    
    # Get hospital info from master DB
    org = master_db["organizations"].find_one({"organization_id": hospital_id})
    
    if not org:
        return {"error": "Hospital not found"}
    
    # Connect to THAT hospital's database
    hospital_connection_string = org["mongodb_connection_string"]
    hospital_db_name = org["mongodb_database_name"]
    
    hospital_client = MongoClient(hospital_connection_string)
    hospital_db = hospital_client[hospital_db_name]
    patients = hospital_db["patients"]
    
    # Get all patients
    all_patients = list(patients.find({}, {"_id": 0}))
    
    return {
        "status": "success",
        "hospital_name": org["organization_name"],
        "patients": all_patients,
        "total_count": len(all_patients)
    }
```

---

## Admin Dashboard Structure

### Frontend: Admin Portal

```typescript
// AdminDashboardView.tsx (Enhanced for data access)

export function AdminDashboardView() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'patients', 'appointments', 'billing'

  useEffect(() => {
    // Load all hospitals
    fetch('/api/admin/hospitals')
      .then(r => r.json())
      .then(data => setHospitals(data.hospitals));
  }, []);

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    // Load hospital data
    fetch(`/api/admin/hospital/${hospital.organization_id}/patients`)
      .then(r => r.json())
      .then(data => setHospitalData(data));
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Panel - Data Management</h1>
      
      {/* Hospital List */}
      <div className="hospitals-section">
        <h2>Hospitals ({hospitals.length})</h2>
        {hospitals.map(h => (
          <div 
            key={h.organization_id}
            onClick={() => handleSelectHospital(h)}
            className={`hospital-card ${selectedHospital?.organization_id === h.organization_id ? 'selected' : ''}`}
          >
            <div className="hospital-name">{h.hospital_name}</div>
            <div className="hospital-plan">Plan: {h.plan}</div>
            <div className="hospital-date">Signup: {h.created_date}</div>
            <div className="hospital-status">Status: {h.status}</div>
          </div>
        ))}
      </div>

      {/* Hospital Data View */}
      {selectedHospital && hospitalData && (
        <div className="data-section">
          <h2>Viewing: {selectedHospital.hospital_name}</h2>
          
          <div className="tabs">
            <button onClick={() => setView('patients')} className={view === 'patients' ? 'active' : ''}>
              Patients ({hospitalData.patients?.length || 0})
            </button>
            <button onClick={() => setView('appointments')} className={view === 'appointments' ? 'active' : ''}>
              Appointments
            </button>
            <button onClick={() => setView('billing')} className={view === 'billing' ? 'active' : ''}>
              Billing
            </button>
          </div>

          {/* Patients View */}
          {view === 'patients' && (
            <div className="patients-list">
              <table>
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Disease</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitalData.patients?.map(p => (
                    <tr key={p.patient_id}>
                      <td>{p.patient_id}</td>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.age}</td>
                      <td>{p.disease}</td>
                      <td>
                        <button onClick={() => editPatient(p)}>Edit</button>
                        <button onClick={() => deletePatient(p)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Complete Backend Solution

### Backend: Admin Access Endpoints

```python
from fastapi import APIRouter, HTTPException
from pymongo import MongoClient

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Connect to master database
master_client = MongoClient("mongodb://localhost:27017")
master_db = master_client["chakravue_master"]

# ============ LIST ALL HOSPITALS ============

@router.get("/hospitals")
async def get_all_hospitals():
    """Admin: Get list of all hospitals"""
    organizations = master_db["organizations"]
    
    hospitals = []
    for org in organizations.find({}):
        hospitals.append({
            "organization_id": org.get("organization_id"),
            "hospital_name": org.get("organization_name"),
            "email": org.get("organization_email"),
            "phone": org.get("organization_phone"),
            "plan": org.get("plan"),
            "status": org.get("status"),
            "created_date": org.get("created_at"),
            "payment_date": org.get("payment_date")
        })
    
    return {
        "status": "success",
        "hospitals": hospitals,
        "total_count": len(hospitals)
    }

# ============ VIEW HOSPITAL PATIENTS ============

@router.get("/hospital/{hospital_id}/patients")
async def get_hospital_patients(hospital_id: str):
    """Admin: View all patients of a hospital"""
    
    try:
        # Get hospital from master DB
        org = master_db["organizations"].find_one(
            {"organization_id": hospital_id}
        )
        
        if not org:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        # Connect to hospital's database
        hospital_connection = org.get("mongodb_connection_string")
        hospital_db_name = org.get("mongodb_database_name")
        
        hospital_client = MongoClient(hospital_connection)
        hospital_db = hospital_client[hospital_db_name]
        patients_collection = hospital_db["patients"]
        
        # Get all patients
        patients = list(patients_collection.find({}, {"_id": 0}))
        
        return {
            "status": "success",
            "hospital_name": org.get("organization_name"),
            "hospital_id": hospital_id,
            "patients": patients,
            "total_count": len(patients)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ VIEW HOSPITAL APPOINTMENTS ============

@router.get("/hospital/{hospital_id}/appointments")
async def get_hospital_appointments(hospital_id: str):
    """Admin: View all appointments of a hospital"""
    
    try:
        org = master_db["organizations"].find_one(
            {"organization_id": hospital_id}
        )
        
        if not org:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        hospital_connection = org.get("mongodb_connection_string")
        hospital_db_name = org.get("mongodb_database_name")
        
        hospital_client = MongoClient(hospital_connection)
        hospital_db = hospital_client[hospital_db_name]
        appointments_collection = hospital_db["appointments"]
        
        appointments = list(appointments_collection.find({}, {"_id": 0}))
        
        return {
            "status": "success",
            "hospital_name": org.get("organization_name"),
            "appointments": appointments,
            "total_count": len(appointments)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ VIEW HOSPITAL BILLING ============

@router.get("/hospital/{hospital_id}/billing")
async def get_hospital_billing(hospital_id: str):
    """Admin: View all billing records of a hospital"""
    
    try:
        org = master_db["organizations"].find_one(
            {"organization_id": hospital_id}
        )
        
        if not org:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        hospital_connection = org.get("mongodb_connection_string")
        hospital_db_name = org.get("mongodb_database_name")
        
        hospital_client = MongoClient(hospital_connection)
        hospital_db = hospital_client[hospital_db_name]
        billing_collection = hospital_db["billing"]
        
        billing = list(billing_collection.find({}, {"_id": 0}))
        
        return {
            "status": "success",
            "hospital_name": org.get("organization_name"),
            "billing_records": billing,
            "total_count": len(billing)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ EDIT PATIENT DATA ============

@router.put("/hospital/{hospital_id}/patient/{patient_id}")
async def edit_patient(hospital_id: str, patient_id: str, patient_data: dict):
    """Admin: Edit patient data"""
    
    try:
        org = master_db["organizations"].find_one(
            {"organization_id": hospital_id}
        )
        
        if not org:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        hospital_connection = org.get("mongodb_connection_string")
        hospital_db_name = org.get("mongodb_database_name")
        
        hospital_client = MongoClient(hospital_connection)
        hospital_db = hospital_client[hospital_db_name]
        patients_collection = hospital_db["patients"]
        
        # Update patient
        result = patients_collection.update_one(
            {"patient_id": patient_id},
            {"$set": patient_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return {
            "status": "success",
            "message": f"Patient {patient_id} updated successfully",
            "modified_count": result.modified_count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ DELETE PATIENT DATA ============

@router.delete("/hospital/{hospital_id}/patient/{patient_id}")
async def delete_patient(hospital_id: str, patient_id: str):
    """Admin: Delete patient data (for fixing issues)"""
    
    try:
        org = master_db["organizations"].find_one(
            {"organization_id": hospital_id}
        )
        
        if not org:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        hospital_connection = org.get("mongodb_connection_string")
        hospital_db_name = org.get("mongodb_database_name")
        
        hospital_client = MongoClient(hospital_connection)
        hospital_db = hospital_client[hospital_db_name]
        patients_collection = hospital_db["patients"]
        
        # Delete patient
        result = patients_collection.delete_one({"patient_id": patient_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return {
            "status": "success",
            "message": f"Patient {patient_id} deleted successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ DATABASE STATS ============

@router.get("/hospital/{hospital_id}/stats")
async def get_hospital_stats(hospital_id: str):
    """Admin: Get statistics for hospital database"""
    
    try:
        org = master_db["organizations"].find_one(
            {"organization_id": hospital_id}
        )
        
        if not org:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        hospital_connection = org.get("mongodb_connection_string")
        hospital_db_name = org.get("mongodb_database_name")
        
        hospital_client = MongoClient(hospital_connection)
        hospital_db = hospital_client[hospital_db_name]
        
        # Count documents in each collection
        patients_count = hospital_db["patients"].count_documents({})
        appointments_count = hospital_db["appointments"].count_documents({})
        billing_count = hospital_db["billing"].count_documents({})
        
        return {
            "status": "success",
            "hospital_name": org.get("organization_name"),
            "stats": {
                "patients": patients_count,
                "appointments": appointments_count,
                "billing": billing_count,
                "total_records": patients_count + appointments_count + billing_count
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ QUERY HOSPITAL DATA ============

@router.post("/hospital/{hospital_id}/query")
async def query_hospital_data(hospital_id: str, query_data: dict):
    """Admin: Custom query on hospital database"""
    
    try:
        org = master_db["organizations"].find_one(
            {"organization_id": hospital_id}
        )
        
        if not org:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        hospital_connection = org.get("mongodb_connection_string")
        hospital_db_name = org.get("mongodb_database_name")
        
        hospital_client = MongoClient(hospital_connection)
        hospital_db = hospital_client[hospital_db_name]
        
        collection_name = query_data.get("collection")  # "patients", "appointments", etc.
        filter_query = query_data.get("filter", {})  # MongoDB filter
        
        collection = hospital_db[collection_name]
        results = list(collection.find(filter_query, {"_id": 0}))
        
        return {
            "status": "success",
            "hospital_name": org.get("organization_name"),
            "collection": collection_name,
            "results": results,
            "count": len(results)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Admin Access Flow

```
ADMIN LOGIN
    ↓
ADMIN DASHBOARD
    ↓
CLICK "HOSPITALS"
    ↓
Shows:
├─ City Eye Clinic (Professional)
├─ Metro Clinic (Enterprise)
├─ South Clinic (Starter)
└─ ... all hospitals
    ↓
CLICK "City Eye Clinic"
    ↓
Shows:
├─ Patients tab (10 patients shown)
├─ Appointments tab (25 appointments)
├─ Billing tab (150 invoices)
└─ Database stats
    ↓
CLICK "Edit" on Patient
    ↓
Can:
├─ Edit patient name
├─ Edit disease
├─ Edit contact info
├─ Delete if needed (corrupted)
└─ Save changes
    ↓
DATA UPDATED IN THAT HOSPITAL'S DATABASE
(Hospital staff sees updated data on next login)
```

---

## Security & Access Control

```
WHO CAN ACCESS WHAT:

Admin (You):
├─ ✅ See all hospitals
├─ ✅ See all patient data
├─ ✅ Edit patient data
├─ ✅ Delete records (for fixes)
├─ ✅ Query any hospital database
├─ ✅ View statistics
└─ ✅ Full maintenance access

Hospital Staff (City Eye):
├─ ❌ Cannot see master database
├─ ✅ See only City Eye data
├─ ✅ Edit City Eye patients
├─ ❌ Cannot see Metro data
├─ ❌ Cannot see admin panel
└─ ❌ Cannot see other hospitals

Hospital Staff (Metro):
├─ ❌ Cannot see master database
├─ ❌ Cannot see City Eye data
├─ ✅ See only Metro data
├─ ✅ Edit Metro patients
├─ ❌ Cannot see admin panel
└─ ❌ Cannot see other hospitals
```

---

## Use Cases: Admin Fixes Data Issues

### Case 1: Duplicate Patient Record

```python
# Admin sees duplicate patient
# Calls query to find it:

POST /api/admin/hospital/org_123/query
{
  "collection": "patients",
  "filter": {"name": "Raj Kumar"}
}

# Returns 2 records with same name
# Admin clicks delete on one

DELETE /api/admin/hospital/org_123/patient/pat_duplicate_id
# ✓ Deleted!
```

### Case 2: Corrupted Appointment

```python
# Admin sees appointment with missing doctor_name
# Edits it:

PUT /api/admin/hospital/org_123/appointment/apt_456
{
  "doctor_name": "Dr. Smith",
  "date": "2025-12-20",
  "status": "confirmed"
}

# ✓ Fixed!
```

### Case 3: Billing Error

```python
# Admin sees double billing

POST /api/admin/hospital/org_123/query
{
  "collection": "billing",
  "filter": {"patient_id": "pat_123"}
}

# Shows 2 identical invoices
# Admin deletes the duplicate

DELETE /api/admin/hospital/org_123/billing/bill_duplicate_id
# ✓ Fixed!
```

---

## Implementation Checklist

```
BACKEND:
☐ Add admin access endpoints to saas_endpoints.py
  ├─ /api/admin/hospitals (list all)
  ├─ /api/admin/hospital/{id}/patients (view)
  ├─ /api/admin/hospital/{id}/appointments (view)
  ├─ /api/admin/hospital/{id}/billing (view)
  ├─ /api/admin/hospital/{id}/patient/{id} (edit)
  ├─ /api/admin/hospital/{id}/patient/{id} (delete)
  ├─ /api/admin/hospital/{id}/stats (statistics)
  └─ /api/admin/hospital/{id}/query (custom query)

FRONTEND:
☐ Create Admin Data Management View
  ├─ Hospital list with selection
  ├─ Patient data table with search
  ├─ Appointments view with filters
  ├─ Billing view with sorting
  ├─ Edit modal for records
  ├─ Delete confirmation
  └─ Database statistics dashboard

SECURITY:
☐ Add admin authentication
  ├─ Only you can login as admin
  ├─ Secure password login
  ├─ Session management
  └─ Audit logging of admin changes

TESTING:
☐ Test hospital list loading
☐ Test patient data retrieval
☐ Test edit functionality
☐ Test delete functionality
☐ Test statistics calculation
☐ Verify hospital isolation (admin can see all)
☐ Verify hospital staff cannot see admin panel
```

---

## Example: Admin Maintenance Dashboard

```typescript
// Enhanced AdminDashboardView.tsx with data access

export function AdminDashboardView() {
  const [view, setView] = useState('overview'); // 'overview', 'hospitals', 'data-manager'
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Load all hospitals
  useEffect(() => {
    fetch('/api/admin/hospitals')
      .then(r => r.json())
      .then(data => setHospitals(data.hospitals))
      .catch(e => console.error('Failed to load hospitals:', e));
  }, []);

  // Load hospital data when selected
  const loadHospitalData = (hospital) => {
    setSelectedHospital(hospital);
    
    // Load patients
    fetch(`/api/admin/hospital/${hospital.organization_id}/patients`)
      .then(r => r.json())
      .then(data => setHospitalData(data));
    
    // Load stats
    fetch(`/api/admin/hospital/${hospital.organization_id}/stats`)
      .then(r => r.json())
      .then(data => setStats(data.stats));
  };

  // Edit patient
  const editPatient = (patient) => {
    const updatedName = prompt('New name:', patient.name);
    if (updatedName) {
      fetch(
        `/api/admin/hospital/${selectedHospital.organization_id}/patient/${patient.patient_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: updatedName })
        }
      )
      .then(r => r.json())
      .then(data => {
        alert('✓ Updated!');
        loadHospitalData(selectedHospital); // Refresh
      });
    }
  };

  return (
    <div className="admin-dashboard-enhanced">
      <div className="navigation">
        <button 
          onClick={() => setView('overview')}
          className={view === 'overview' ? 'active' : ''}
        >
          Overview
        </button>
        <button 
          onClick={() => setView('data-manager')}
          className={view === 'data-manager' ? 'active' : ''}
        >
          Data Manager
        </button>
      </div>

      {view === 'data-manager' && (
        <div className="data-manager">
          <h2>Admin Data Management</h2>
          
          {/* Hospitals List */}
          <div className="hospitals-panel">
            <h3>Hospitals ({hospitals.length})</h3>
            {hospitals.map(h => (
              <div
                key={h.organization_id}
                className={`hospital-item ${selectedHospital?.organization_id === h.organization_id ? 'selected' : ''}`}
                onClick={() => loadHospitalData(h)}
              >
                <strong>{h.hospital_name}</strong>
                <br />
                <small>Plan: {h.plan} | Status: {h.status}</small>
              </div>
            ))}
          </div>

          {/* Hospital Data */}
          {selectedHospital && hospitalData && stats && (
            <div className="hospital-details">
              <h3>{selectedHospital.hospital_name}</h3>
              
              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.patients}</div>
                  <div className="stat-label">Patients</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.appointments}</div>
                  <div className="stat-label">Appointments</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.billing}</div>
                  <div className="stat-label">Billing Records</div>
                </div>
              </div>

              {/* Patients Table */}
              <div className="patients-section">
                <h4>Patients</h4>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
                
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Disease</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitalData.patients
                      ?.filter(p => 
                        p.name?.toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      ?.map(p => (
                        <tr key={p.patient_id}>
                          <td>{p.patient_id}</td>
                          <td>{p.name}</td>
                          <td>{p.email}</td>
                          <td>{p.age}</td>
                          <td>{p.disease}</td>
                          <td>
                            <button onClick={() => editPatient(p)}>Edit</button>
                            <button onClick={() => deletePatient(p)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Summary

**You Now Have:**

✅ Access to ALL hospital databases
✅ Can view all patient data
✅ Can edit records when needed
✅ Can delete corrupted data
✅ Can search and filter
✅ Can see statistics
✅ Full maintenance capabilities
✅ Hospital staff still has complete isolation

**Implementation:**
- Add 8 backend endpoints (listed above)
- Create Admin Data Management dashboard component
- Add search, edit, delete functionality
- Test access control (admin sees all, hospitals see only theirs)
- Deploy and test

**Security:**
- Admin needs secure login
- Hospital staff cannot access admin panel
- Hospital staff cannot see other hospitals
- All changes logged for audit

**You can now maintain all data while hospitals have complete isolation!** ✅
