# Pharmacy Medicine Management - Quick Guide

## How to Add New Medicines (Method 1 - API)

### Option A: Using Browser Console (Easiest)

1. Open your pharmacy page (http://localhost:3000)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Copy and paste one of these commands:

#### **Quick Add (Simple)**
```javascript
// Add Eye Drops medicine with basic info
fetch('http://localhost:8008/pharmacy/medicines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Ofloxacin Eye Drop',
    category: 'Eye Drops',
    price: 120,
    stock: 60,
    description: 'Antibiotic eye drops for infections',
    manufacturer: 'Cipla',
    batch_number: 'BATCH-2025-001',
    expiry_date: '2026-12-31',
    reorder_level: 10
  })
})
.then(r => r.json())
.then(d => alert('✓ Medicine Added: ' + d.medicineId))
.catch(e => alert('Error: ' + e.message))
```

#### **Full Add (With All Details)**
```javascript
// Add Tablet medicine with complete information
fetch('http://localhost:8008/pharmacy/medicines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Acetazolamide 250mg',
    category: 'Tablets',
    price: 85,
    stock: 100,
    description: 'Glaucoma treatment tablet',
    manufacturer: 'Alcon',
    batch_number: 'BATCH-2025-ACZ-001',
    expiry_date: '2027-06-30',
    reorder_level: 15
  })
})
.then(r => r.json())
.then(d => alert('✓ Added: ' + d.medicineId))
.catch(e => alert('Error: ' + e.message))
```

---

### Option B: Using PowerShell (For Multiple Updates)

```powershell
# Add a new medicine
$medicine = @{
    name = "Timolol Eye Drop"
    category = "Eye Drops"
    price = 95
    stock = 75
    description = "Beta blocker for glaucoma"
    manufacturer = "Bausch Health"
    batch_number = "BATCH-2025-TMO-001"
    expiry_date = "2026-12-31"
    reorder_level = 12
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8008/pharmacy/medicines" `
  -Method Post `
  -ContentType "application/json" `
  -Body $medicine
```

---

## How to Update Stock

### Option A: Browser Console
```javascript
// Update stock for medicine ID
fetch('http://localhost:8008/pharmacy/medicines/[MEDICINE_ID]/stock', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ newStock: 150 })
})
.then(r => r.json())
.then(d => alert('✓ Stock Updated to 150'))
.catch(e => alert('Error: ' + e.message))
```

Replace `[MEDICINE_ID]` with the actual medicine ID (you get this when you add a medicine).

### Option B: PowerShell
```powershell
Invoke-WebRequest -Uri "http://localhost:8008/pharmacy/medicines/[MEDICINE_ID]/stock" `
  -Method Put `
  -ContentType "application/json" `
  -Body '{"newStock": 150}'
```

---

## How to Update Medicine Details

### Browser Console
```javascript
// Update medicine price, name, or other details
fetch('http://localhost:8008/pharmacy/medicines/[MEDICINE_ID]', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    price: 110,
    description: "Updated description here",
    batch_number: "BATCH-NEW"
  })
})
.then(r => r.json())
.then(d => alert('✓ Medicine Updated'))
.catch(e => alert('Error: ' + e.message))
```

---

## Available Categories

Choose one of these for the `category` field:
- `Eye Drops` - Liquid medications for eyes
- `Tablets` - Oral tablets
- `Ointments` - Topical cream/ointment
- `Contact Lens` - Contact lens solutions
- `Surgical` - Surgical instruments/materials

---

## Common Medicine Examples

### Eye Drops
```
Name: Ofloxacin Eye Drop
Price: ₹120
Stock: 60
Description: Antibiotic eye drops for infections
```

### Tablets
```
Name: Acetazolamide 250mg
Price: ₹85
Stock: 100
Description: Glaucoma treatment tablet
```

### Ointments
```
Name: Chloramphenicol Ointment
Price: ₹95
Stock: 40
Description: Antibiotic ointment for eye infections
```

### Surgical
```
Name: Sterile Surgical Gauze
Price: ₹30
Stock: 200
Description: Medical grade sterile gauze
```

---

## Troubleshooting

**Error: "Failed to add medicine"**
- Check all required fields are filled
- Expiry date format must be YYYY-MM-DD
- Price and stock must be numbers

**Error: "Medicine ID not found"**
- Copy the ID from the success message when you added the medicine
- Medicine IDs are MongoDB ObjectIds (long strings)

**Stock not updating?**
- Make sure you're using the correct medicine ID
- Check the newStock value is a number (not a string)

---

## Tips

- **Batch Numbers**: Use format `BATCH-YYYY-MmmDd-CODE` (e.g., `BATCH-2025-Dec11-OFX`)
- **Reorder Level**: Typically 15-20% of your average usage
- **Expiry Date**: Always use YYYY-MM-DD format
- **Stock**: Keep at least 20% buffer above reorder level

---

## Need to Add Medicines from Frontend?

You can import the helper functions in any component:

```typescript
import { quickAddMedicine, updateMedicineStock } from '../utils/pharmacyAPI';

// Add medicine
await quickAddMedicine(
  'Medicine Name',
  'Eye Drops',
  120,
  60,
  'Description here'
);

// Update stock
await updateMedicineStock('medicineId123', 150);
```

---

**Having issues?** Check the browser console (F12) for detailed error messages!
