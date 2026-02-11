# Phase 2 Testing Guide

## Pre-Test Checklist

Before testing, ensure:
- [ ] Backend server running on port 8008
- [ ] MongoDB connection active
- [ ] Frontend running on port 5173 (or configured port)
- [ ] Your browser's dev console is open to catch any errors
- [ ] At least one test patient exists in the system

---

## Test Scenario 1: Create and Save a Surgery Package ⭐

### Objective
Create a surgery bill and save it as a reusable package with duplicate prevention.

### Steps
1. **Navigate to Patient Billing**
   - Go to Billing menu
   - Select "Individual Billing"
   
2. **Select a Test Patient**
   - Click on the search box: "Search patient by name, phone, or email..."
   - Type patient name or phone number (test the phone search!)
   - Select the patient

3. **Add Surgery Items**
   - Click the green "Add Services & Items" button (original button)
   - Or use the new "Surgeries" button to load a pre-made package
   - For this test, manually add items:
     - Surgeon Charges: ₹10,000
     - OT Charges: ₹5,000
     - Nursing: ₹2,000
   - Total should be: ₹17,000

4. **Set Surgery Dates** (NEW!)
   - Look for "Date of Surgery" and "Date of Discharge" fields
   - Set Surgery Date: 17/01/2025
   - Set Discharge Date: 19/01/2025
   - Should appear below "Claim Number" field

5. **Save as Package**
   - Scroll down, find "Save as Package" button
   - Click it, enter name: "Test Phaco Package"
   - Click "Save Package"
   - Should see success message

### Expected Results
✅ Package appears in surgery_packages collection  
✅ Success alert shows package saved  
✅ Fields: packageName, items, totalAmount, lastUsedDate, usageCount=1  

### ❌ If It Fails
- Check browser console for error messages
- Verify MongoDB is connected
- Check API endpoint `/api/save-surgery-package` was called
- Verify bill has at least one item

---

## Test Scenario 2: Test Duplicate Prevention 🔒

### Objective
Verify that duplicate packages cannot be created.

### Steps
1. **Create Two Bills with Same Amount**
   - Create a bill with items totaling ₹17,000 (same as before)
   - Add different items, but ensure total = ₹17,000
   - Try to save as package with same name: "Test Phaco Package"

2. **Expected Error**
   - Should see error: "Package with this name and amount already exists"
   - Package should NOT be created

3. **Create Bill with Same Name but Different Amount**
   - Create a new bill with ₹18,000 total
   - Save as: "Test Phaco Package" (same name)
   - This SHOULD work (different amount)

4. **Verify Results**
   - Now you have 2 packages with same name but different amounts
   - Both should exist in database
   - This confirms duplicate prevention checks BOTH name AND amount

### Expected Results
✅ First duplicate attempt blocked with error  
✅ Different amount version created successfully  
✅ Both packages exist with same name but different amounts  

### ❌ If It Fails
- Check MongoDB for existing packages with that name
- Verify API returns 409 Conflict on duplicate
- Check backend endpoint logic in main.py

---

## Test Scenario 3: Use Surgery Selection Modal 🎨

### Objective
Open the modal and select a package to add to bill.

### Steps
1. **Create a Fresh Bill**
   - Select a new patient
   - Don't add any items yet

2. **Click "Surgeries" Button** (NEW!)
   - You should see a new gold button labeled "Surgeries"
   - Located next to "Add Services & Items" title
   - Click it

3. **Modal Should Open**
   - See title: "Select Surgery Package"
   - See "Recently Used" section at top
   - See search bar below
   - See grid of packages (4 columns)
   - See pagination controls if many packages

4. **Test Recently Used Section**
   - Should show your "Test Phaco Package"
   - Shows: Package name, item count, total amount
   - Shows: "Used 1 time" (if used before)

5. **Test Search**
   - Type "phaco" in search bar
   - Packages should filter in real-time
   - Clear search, should show all again

6. **Select a Package**
   - Click "Add to Bill" on any package
   - Modal should close
   - Items should appear in bill above

7. **Verify Items Added**
   - See items in the bill table
   - Quantities and amounts match package
   - Total reflects package total

### Expected Results
✅ Modal opens with proper layout  
✅ Recently used packages shown  
✅ Search filters packages  
✅ Pagination works (if many packages)  
✅ Selected package items added to bill  
✅ Modal closes after selection  

### ❌ If It Fails
- Check browser console for component errors
- Verify API endpoints called:
  - GET `/api/surgery-packages/recent`
  - GET `/api/surgery-packages/search`
- Verify SurgerySelectionModal component imported

---

## Test Scenario 4: Save Bill with Dates 📅

### Objective
Save a bill with surgery and discharge dates, verify they're stored.

### Steps
1. **Create a Surgery Bill**
   - Select patient
   - Use "Surgeries" button to add a package
   - Set Surgery Date: 20/01/2025
   - Set Discharge Date: 22/01/2025

2. **Enable Insurance** (for complete bill)
   - Toggle "Govt Insurance"
   - Select: Category, Company, TPA
   - Enter Claim Number

3. **Save Initial Bill**
   - Scroll to surgery billing section
   - Click "Create Initial Bill"
   - Should see success alert with bill details

4. **Verify Dates Sent**
   - Open browser Dev Tools → Network tab
   - Look for POST to `/api/billing/patient/{id}/surgery-bills/initial`
   - Check payload includes:
     - `dateOfSurgery`: "2025-01-20" (or similar format)
     - `dateOfDischarge`: "2025-01-22"

5. **Check Alert Message**
   - Alert should show amounts
   - Coverage amount shown in alert (not in UI)

### Expected Results
✅ Bill created successfully  
✅ Dates included in payload  
✅ Database record has dates  
✅ Bill ID returned in alert  

### ❌ If It Fails
- Check date format (should be YYYY-MM-DD)
- Verify both date fields are filled
- Check backend endpoint error messages
- Look for MongoDB connection issues

---

## Test Scenario 5: Phone Number Patient Search 📱

### Objective
Test that patient search works with phone numbers (not just names).

### Steps
1. **Get a Test Patient's Phone**
   - Note down a patient's phone number
   - E.g., "9876543210"

2. **Open New Bill**
   - Go to Patient Billing

3. **Search by Phone**
   - Click patient search box
   - Type phone number: "9876543210"
   - Press Enter or wait for dropdown

4. **Expected Result**
   - Patient appears in dropdown
   - Shows: Name, Email, Phone, Registration ID
   - Click to select

5. **Test Other Search Types**
   - By Name: "John"
   - By Email: "john@example.com"
   - By Registration ID: "REG123"
   - All should work

### Expected Results
✅ Phone search returns patient  
✅ Name search works  
✅ Email search works  
✅ Multiple results shown if applicable  

### ❌ If It Fails
- Check PATIENTS_SEARCH endpoint
- Verify patient data in MongoDB
- Backend search logic not updated (might need manual fix)

---

## Test Scenario 6: Invoice Printing with Dates 🖨️

### Objective
Print a bill and verify dates appear on the invoice.

### Steps
1. **Create and Save a Bill**
   - Follow Scenario 4
   - Complete and save the bill

2. **Look for Print Button**
   - After bill creation, alert might offer print option
   - Or find "Print" button in bill history

3. **Click Print**
   - Print dialog should open
   - Or preview should show

4. **Verify Dates on Invoice**
   - Look for "Date of Surgery: 20/01/2025"
   - Look for "Date of Discharge: 22/01/2025"
   - Should appear near top with patient info

5. **Print to PDF**
   - Save as PDF to verify dates persist
   - Close and verify PDF has dates

### Expected Results
✅ Invoice displays surgery date  
✅ Invoice displays discharge date  
✅ Dates appear in printable format  
✅ PDF saved includes dates  

### ❌ If It Fails
- Check invoice template includes date fields
- Verify handlePrintInitialBill() passes dates
- Check PDF generation logic

---

## Test Scenario 7: Coverage/Refund Alert Display 💰

### Objective
Verify that coverage and refund amounts are shown ONLY in alerts, not in UI.

### Steps
1. **Create Initial Bill**
   - Enable insurance
   - Set estimated coverage: ₹50,000
   - Set total surgery cost: ₹60,000
   - Save initial bill

2. **Check Alert**
   - Alert message should show: "Est. Coverage: ₹50,000" ← IN ALERT
   - But should NOT appear as label in the form

3. **Create Final Bill**
   - Use same bill
   - Set insurance approved: ₹45,000
   - Save final bill

4. **Check Final Alert**
   - Alert should show refund calculation
   - Refund/Balance amount shown in alert
   - NOT shown in form labels

### Expected Results
✅ Coverage shown only in alert  
✅ Refund shown only in alert  
✅ UI doesn't display these values as labels  
✅ Cleaner form appearance  

### ❌ If It Fails
- Check UI components for coverage/refund displays
- Look for HTML elements with those labels
- Verify backend removes these from UI response

---

## Performance Test 🚀

### Test: Modal with 100+ Packages
**Objective**: Verify modal performs well with many packages

### Steps
1. **Create Many Test Packages**
   - Add 50-100 packages to database (via script or manual)
   - Each with different names

2. **Open Surgery Modal**
   - Should load within 2-3 seconds
   - No freezing or lag

3. **Test Search Performance**
   - Type search term
   - Filtering should be instant (< 500ms)
   - Pagination should be smooth

4. **Test Scrolling**
   - Grid should scroll smoothly
   - No jank or stuttering
   - Cards load properly

### Expected Results
✅ Modal loads quickly  
✅ Search is responsive  
✅ Pagination works  
✅ No UI freezes  

### ❌ If It Fails
- Check for N+1 queries in backend
- Verify pagination limit is set (16 items/page)
- Check frontend rendering performance
- Use React DevTools Profiler to check

---

## Cleanup After Testing

### Reset Test Data
```bash
# Clear test packages
db.surgery_packages.deleteMany({
  "packageName": { $regex: "Test" }
})

# Clear test bills
db.initial_surgery_bills.deleteMany({
  "registrationId": "TEST-123"
})
```

### Keep One Sample Package
- Save at least one working package
- Use for future demos/tests

---

## Common Issues & Fixes

### Issue: "Package with this name already exists" but it's a new name
**Fix**: Check both name AND amount match
- Query: `db.surgery_packages.find({ packageName: "..." })`
- Look for duplicate amounts

### Issue: Modal doesn't open
**Fix**: 
- Check browser console for errors
- Verify `showSurgerySelectionModal` state exists
- Check SurgerySelectionModal component imported

### Issue: Dates not saving
**Fix**:
- Verify date format (should be YYYY-MM-DD)
- Check backend validation
- Look for MongoDB schema issues

### Issue: Recently used empty
**Fix**:
- Create and save a package first
- Modal only shows if packages exist
- Check `lastUsedDate` is being set

### Issue: Search not working
**Fix**:
- Check GET `/api/surgery-packages/search` endpoint
- Verify packages exist in database
- Check search term formatting

---

## Test Data Checklist

Before testing, prepare:
- [ ] At least 1 test patient
- [ ] At least 1 test patient with phone number
- [ ] Insurance company configured
- [ ] At least 3-5 surgery packages in database

---

## Reporting Results

When testing complete, note:
- ✅ What worked
- ❌ What didn't work
- 🐛 Any errors in console
- 📸 Screenshots of issues
- ⏱️ Performance observations

**Submit results to:** Development team  
**Format**: Detailed test report with step-by-step reproduction

---

**Happy Testing! 🎉**
