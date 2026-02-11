# How to Use the Add Medicine Modal in Your Website

## Step 1: Add the Modal to PharmacyBillingView

Open `src/components/PharmacyBillingView.tsx` and make these changes:

### Add Import at the Top
```typescript
import { AddMedicineModal } from './AddMedicineModal';
```

### Add State for Modal
Inside the component, add this state:
```typescript
const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
```

### Add Button to Header
Find the header section and add a button:
```typescript
<div className="p-6 border-b border-[#2a2a2a]">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-white">OphtalMed Pharmacy</h1>
      <p className="text-[#8B8B8B] text-sm">Touch Screen Billing System</p>
    </div>
    <div className="flex items-center gap-3">
      {/* Add this button */}
      <button
        onClick={() => setShowAddMedicineModal(true)}
        className="px-4 py-2 bg-[#D4A574] text-[#0a0a0a] rounded-lg hover:bg-[#C9955E] transition-colors font-semibold flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Medicine
      </button>
      
      {patientName && (
        <div className="flex items-center gap-3 bg-[#121212] px-4 py-3 rounded-lg border border-[#2a2a2a]">
          {/* existing patient info */}
        </div>
      )}
    </div>
  </div>
</div>
```

### Add Modal Before Closing Tag
At the end of the return statement, before the closing `</div>`, add:
```typescript
{/* Add Medicine Modal */}
<AddMedicineModal
  isOpen={showAddMedicineModal}
  onClose={() => setShowAddMedicineModal(false)}
  onMedicineAdded={() => {
    // Refresh medicines list after adding
    setSelectedCategory('All');
    // Optional: Fetch medicines again
  }}
/>
```

### Add Import for Plus Icon (if not already imported)
Make sure `Plus` is imported from lucide-react:
```typescript
import { ShoppingCart, Plus, Minus, Trash2, Search, Eye } from 'lucide-react';
```

---

## Step 2: Add Modal to Settings or Admin Panel

Alternatively, you can add the "Add Medicine" button to your `SettingsView.tsx`:

```typescript
import { AddMedicineModal } from './AddMedicineModal';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function SettingsView() {
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);

  return (
    <div>
      {/* Existing settings content */}
      
      {/* Add Pharmacy Settings Section */}
      <div className="p-6 rounded-lg bg-[#121212] border border-[#2a2a2a]">
        <h3 className="text-white font-bold text-lg mb-4">Pharmacy Management</h3>
        <button
          onClick={() => setShowAddMedicineModal(true)}
          className="px-4 py-2 bg-[#D4A574] text-[#0a0a0a] rounded-lg hover:bg-[#C9955E] transition-colors font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      {/* Modal */}
      <AddMedicineModal
        isOpen={showAddMedicineModal}
        onClose={() => setShowAddMedicineModal(false)}
        onMedicineAdded={() => {
          // Refresh or update UI
          console.log('Medicine added successfully');
        }}
      />
    </div>
  );
}
```

---

## Step 3: How to Use It

1. Click the **"Add Medicine"** button
2. A modal form will appear
3. Fill in the details:
   - **Medicine Name** ⭐ (Required)
   - **Category** ⭐ (Eye Drops, Tablets, Ointments, etc.)
   - **Price** ⭐ (Required)
   - **Stock Quantity** ⭐ (Required)
   - **Description** (Optional)
   - **Manufacturer** (Optional)
   - **Batch Number** (Optional)
   - **Expiry Date** ⭐ (Required - use date picker)
   - **Reorder Level** (Optional)
4. Click **"Add Medicine"** button
5. Success message will show with the medicine ID
6. The modal closes automatically
7. New medicine appears in your pharmacy list!

---

## Form Validation

The form automatically validates:
- ✅ Medicine name is not empty
- ✅ Price is greater than 0
- ✅ Stock is not negative
- ✅ Expiry date is provided
- ✅ All fields are properly formatted

If validation fails, you'll see an error alert explaining what's wrong.

---

## Full Working Example

Here's the complete updated code for `PharmacyBillingView.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Search, Eye } from 'lucide-react';
import API_ENDPOINTS from '../config/api';
import { AddMedicineModal } from './AddMedicineModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

// ... rest of your imports and component code ...

export function PharmacyBillingView({
  registrationId,
  patientName,
  onBillingComplete
}: PharmacyBillingViewProps) {
  // ... existing state ...
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);

  // ... rest of your component ...

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0a0a0a] to-[#1a1a1a] flex flex-col">
      {/* Header with Add Medicine Button */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">OphtalMed Pharmacy</h1>
            <p className="text-[#8B8B8B] text-sm">Touch Screen Billing System</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddMedicineModal(true)}
              className="px-4 py-2 bg-[#D4A574] text-[#0a0a0a] rounded-lg hover:bg-[#C9955E] transition-colors font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
            {patientName && (
              <div className="flex items-center gap-3 bg-[#121212] px-4 py-3 rounded-lg border border-[#2a2a2a]">
                <div className="w-10 h-10 bg-[#D4A574] rounded-full flex items-center justify-center text-[#0a0a0a] font-bold">
                  {patientName.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{patientName}</p>
                  <p className="text-[#8B8B8B] text-xs">Reg ID: {registrationId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ... rest of your JSX ... */}

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={showAddMedicineModal}
        onClose={() => setShowAddMedicineModal(false)}
        onMedicineAdded={() => {
          // Optional: refresh medicines
          setSelectedCategory('All');
        }}
      />
    </div>
  );
}
```

---

## Tips

- **Easy Input**: Use the date picker for expiry date (no manual typing needed)
- **Smart Defaults**: Reorder level auto-calculates as 20% of stock if you leave it empty
- **Real-time**: Medicine appears in list immediately after adding
- **Mobile Friendly**: Modal works on touch screens and desktop
- **Validation**: All required fields are marked with ⭐

That's it! You can now add medicines directly from your website! 🎉
