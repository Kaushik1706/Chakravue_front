# Surgery Packages Feature - Quick Reference

## 🎯 What is Surgery Packages?

A reusable template system for surgery billing that allows doctors to save common surgery configurations and use them for future patients. Instead of manually entering all line items every time, select a saved package and it auto-fills the bill.

---

## ⚡ Quick Start

### For Doctors (Creating/Managing Packages)

**Access:** Dashboard → Surgery Packages Manager (Doctor role only)

#### Create Package
1. Click "New Package" button
2. Enter package name (e.g., "Standard Cataract Surgery")
3. Add items by clicking "+ Add Item"
4. Enter description and amount for each item
5. Total auto-calculates
6. Click "Create Package"

#### Edit Package
1. Find package in list
2. Click "Edit" button
3. Modify name/items
4. Click "Update Package"

#### Delete Package
1. Find package in list
2. Click "Delete" button
3. Confirm deletion

---

### For Bill Incharge (Using Packages)

**Access:** Patient Billing → Add Services & Items section

#### Load Saved Package
1. In billing view, if packages exist
2. Dropdown appears: "Or Load Saved Surgery Package"
3. Select package from dropdown
4. All items auto-load into bill
5. Continue with normal billing

#### Save Current Bill as Package
1. After creating surgery bill with items
2. Click "Save & Finalize"
3. If bill has surgery items → Popup appears
4. Enter package name
5. Click "Save Package"
6. Package ready for reuse

#### Skip Package Saving
1. After "Save & Finalize"
2. In popup, click "Skip"
3. Bill saved, no package created

---

## 🔧 Technical Details

### Backend Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/surgery-packages` | Create new package |
| GET | `/api/surgery-packages` | List all packages |
| GET | `/api/surgery-packages/{id}` | Get specific package |
| PUT | `/api/surgery-packages/{id}` | Update package |
| DELETE | `/api/surgery-packages/{id}` | Delete package |

### Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| SurgeryPackagesManager | `src/components/` | Doctor package management UI |
| IndividualBillingView | `src/components/` | Enhanced with package loading/saving |

### API Configuration

```typescript
API_ENDPOINTS.SURGERY_PACKAGES: {
  CREATE, GET_ALL, GET_ONE(), UPDATE(), DELETE()
}
```

---

## 💾 Database Schema

```json
{
  "_id": "ObjectId",
  "hospitalId": "string",
  "name": "string",
  "items": [
    {
      "description": "string",
      "amount": number
    }
  ],
  "totalAmount": number,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## 🚀 Features

✅ **Create** - Save surgery configurations as templates  
✅ **Read** - View all packages with details  
✅ **Update** - Edit package name and items  
✅ **Delete** - Remove unused packages  
✅ **Auto-Load** - One-click package loading into bills  
✅ **Auto-Calculate** - Total amount computed automatically  
✅ **Auto-Save** - Option to save bill as package  
✅ **Role-Based** - Doctor-only management access  
✅ **Hospital-Scoped** - Each hospital has own packages  
✅ **Timestamps** - Track creation/modification dates  

---

## 📋 Data Flow

### Saving Package from Bill
```
Bill Created (with Surgery Items)
    ↓
Click "Save & Finalize"
    ↓
Bill saved successfully
    ↓
Popup: "Save as Reusable Package?"
    ↓
Enter package name
    ↓
Extract items → POST to /api/surgery-packages
    ↓
Package stored in MongoDB
    ↓
Added to packages dropdown
```

### Loading Package into Bill
```
Click package dropdown
    ↓
Select "Standard Cataract Surgery"
    ↓
handleLoadPackage() invoked
    ↓
All items added to current bill
    ↓
Calculations updated
    ↓
Ready to modify/save
```

---

## 🔒 Access Control

| Feature | Role | Access |
|---------|------|--------|
| View All Packages | DOCTOR | ✅ |
| Create Package | DOCTOR | ✅ |
| Edit Package | DOCTOR | ✅ |
| Delete Package | DOCTOR | ✅ |
| Load Package (Billing) | All Roles | ✅ |
| Save Bill as Package | All Roles | ✅ |

---

## ⚙️ State Management

### IndividualBillingView States
```typescript
showSaveAsPackagePopup     // Popup visibility
packageName                // User input for package name
isSavingAsPackage          // Loading state during save
savedPackages              // List of all packages
loadingPackages            // Loading state for fetch
```

---

## 🎨 UI Elements

### SurgeryPackagesManager
- **Card Layout** - Each package displayed as card
- **Item Breakdown** - Shows all items with amounts
- **Action Buttons** - Edit, Delete, Select
- **Form Modal** - Create/Edit inline form
- **Total Display** - Auto-calculated total

### IndividualBillingView
- **Dropdown Select** - Load packages
- **Popup Modal** - Save as package
- **Loading States** - Visual feedback
- **Alerts** - Success/error messages

---

## 📊 Example Package

### Name: "Standard Cataract Surgery"

| Item | Amount |
|------|--------|
| SURGEON CHARGES | ₹10,000 |
| NURSING CHARGES | ₹1,500 |
| ROOM CHARGES | ₹1,500 |
| Consumables | ₹3,000 |
| **Total** | **₹16,000** |

---

## 🔍 Validation Rules

✅ **Package Name Required** - Cannot be empty  
✅ **Item Description Required** - Cannot be blank  
✅ **Amount Required** - Must be numeric, > 0  
✅ **At least 1 Item** - Package must have items  
✅ **ObjectId Valid** - Must be valid MongoDB ID  
✅ **Hospital Match** - Only access own hospital packages  

---

## 🚨 Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Package name is required" | Empty name field | Enter package name |
| "All items must have descriptions" | Missing item description | Fill all item details |
| "Failed to save package" | Network/server error | Check server, retry |
| "Failed to delete package" | Package not found | Refresh and try again |
| Invalid ObjectId error | Corrupted ID | Contact support |

---

## 📱 Browser Compatibility

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  

---

## 🔗 Related Features

- **Billing View** - Main feature for creating bills
- **Pharmacy Medicines** - Similar import system
- **Coupon System** - Discount management
- **Hospital Management** - Multi-tenant setup

---

## 📝 Implementation Status

| Component | Status | Lines | Tests |
|-----------|--------|-------|-------|
| Backend Models | ✅ DONE | 45 | ✅ |
| Backend Endpoints | ✅ DONE | 120 | ✅ |
| Frontend API Config | ✅ DONE | 10 | ✅ |
| SurgeryPackagesManager | ✅ DONE | 300+ | ✅ |
| Billing Integration | ✅ DONE | 50+ | ✅ |

---

## 🆘 Support

**Documentation:** See `SURGERY_PACKAGES_IMPLEMENTATION.md`  
**Issues:** Check error messages in console  
**Support:** Contact development team  

---

**Last Updated:** January 13, 2025  
**Feature Status:** ✅ Production Ready
