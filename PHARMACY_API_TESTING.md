# Pharmacy API Testing Guide

## API Testing Examples

### Prerequisites

- Backend running at `http://localhost:8008`
- MongoDB connected
- Sample data initialized

---

## Initialize Sample Data

First-time setup to populate pharmacy with sample medicines:

```bash
curl -X POST http://localhost:8008/pharmacy/initialize-sample-data
```

**Response:**
```json
{
  "status": "success",
  "message": "Sample pharmacy data initialized with 10 medicines",
  "count": 10
}
```

---

## 1. Fetch All Medicines

```bash
curl -X GET http://localhost:8008/pharmacy/medicines
```

**Response:**
```json
{
  "status": "success",
  "total": 10,
  "medicines": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Refresh Tears",
      "category": "Eye Drops",
      "price": 150.0,
      "stock": 50,
      "description": "Artificial tears for dry eyes",
      "manufacturer": "Allergan",
      "batch_number": "AB-2025-001",
      "expiry_date": "2026-12-31",
      "reorder_level": 10
    },
    ...
  ]
}
```

---

## 2. Filter by Category

```bash
curl -X GET "http://localhost:8008/pharmacy/medicines?category=Eye%20Drops"
```

**Try Different Categories:**
- `Eye Drops`
- `Tablets`
- `Ointments`
- `Contact Lens`
- `Surgical`

---

## 3. Get Specific Medicine

```bash
curl -X GET http://localhost:8008/pharmacy/medicines/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Refresh Tears",
  "category": "Eye Drops",
  "price": 150.0,
  "stock": 50,
  "description": "Artificial tears for dry eyes",
  "manufacturer": "Allergan",
  "batch_number": "AB-2025-001",
  "expiry_date": "2026-12-31",
  "reorder_level": 10
}
```

---

## 4. Create a Pharmacy Bill

```bash
curl -X POST http://localhost:8008/pharmacy/billing \
  -H "Content-Type: application/json" \
  -d '{
    "registrationId": "REG-2025-123456",
    "patientName": "John Doe",
    "items": [
      {
        "medicineId": "507f1f77bcf86cd799439011",
        "name": "Refresh Tears",
        "quantity": 2,
        "price": 150.0,
        "total": 300.0
      },
      {
        "medicineId": "507f1f77bcf86cd799439012",
        "name": "Paracetamol 500mg",
        "quantity": 1,
        "price": 25.0,
        "total": 25.0
      }
    ],
    "totalAmount": 325.0,
    "paymentMethod": "cash"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Pharmacy bill created successfully",
  "billId": "BILL-20251210144530-ABC123",
  "totalAmount": 325.0,
  "itemsCount": 2
}
```

**Notes:**
- Validates stock before processing
- Updates medicine inventory automatically
- Saves bill to pharmacy_billing collection
- Records in patient's pharmacy history

---

## 5. Get Patient's Bills

```bash
curl -X GET http://localhost:8008/pharmacy/billing/patient/REG-2025-123456
```

**Response:**
```json
{
  "status": "success",
  "registrationId": "REG-2025-123456",
  "totalBills": 1,
  "bills": [
    {
      "billId": "BILL-20251210144530-ABC123",
      "registrationId": "REG-2025-123456",
      "patientName": "John Doe",
      "items": [
        {
          "medicineId": "507f1f77bcf86cd799439011",
          "name": "Refresh Tears",
          "quantity": 2,
          "price": 150.0,
          "total": 300.0
        }
      ],
      "totalAmount": 325.0,
      "paymentMethod": "cash",
      "status": "completed",
      "billDate": "2025-12-10T14:45:30.000Z",
      "createdAt": "2025-12-10T14:45:30.000Z"
    }
  ]
}
```

---

## 6. Get Specific Bill

```bash
curl -X GET http://localhost:8008/pharmacy/billing/BILL-20251210144530-ABC123
```

**Response:**
```json
{
  "billId": "BILL-20251210144530-ABC123",
  "registrationId": "REG-2025-123456",
  "patientName": "John Doe",
  "items": [...],
  "totalAmount": 325.0,
  "paymentMethod": "cash",
  "status": "completed",
  "billDate": "2025-12-10T14:45:30.000Z",
  "createdAt": "2025-12-10T14:45:30.000Z"
}
```

---

## 7. Update Medicine Stock

```bash
curl -X PUT http://localhost:8008/pharmacy/medicines/507f1f77bcf86cd799439011/stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity_sold": 5
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Stock updated from 50 to 45",
  "previousStock": 50,
  "newStock": 45,
  "quantitySold": 5
}
```

---

## 8. Get Stock Report

```bash
curl -X GET http://localhost:8008/pharmacy/stock-report
```

**Response:**
```json
{
  "status": "success",
  "totalMedicines": 10,
  "totalInventoryValue": 45000.50,
  "lowStockMedicines": [
    {
      "id": "507f1f77bcf86cd799439009",
      "name": "IOL (Intraocular Lens)",
      "stock": 3,
      "reorderLevel": 5,
      "needed": 2
    },
    {
      "id": "507f1f77bcf86cd799439008",
      "name": "Monthly Contact Lens",
      "stock": 8,
      "reorderLevel": 10,
      "needed": 2
    }
  ],
  "lowStockCount": 2
}
```

---

## 9. Create New Medicine

```bash
curl -X POST http://localhost:8008/pharmacy/medicines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ciprofloxacin Eye Drops",
    "category": "Eye Drops",
    "price": 120.0,
    "stock": 50,
    "description": "Antibiotic eye drops for infections",
    "manufacturer": "Cipla",
    "batch_number": "CP-2025-001",
    "expiry_date": "2026-06-30",
    "reorder_level": 10
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Medicine Ciprofloxacin Eye Drops added to inventory",
  "medicineId": "507f1f77bcf86cd799439014"
}
```

---

## 10. Update Medicine Details

```bash
curl -X PUT http://localhost:8008/pharmacy/medicines/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 160.0,
    "stock": 75,
    "reorder_level": 15
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Medicine updated"
}
```

---

## Common Testing Scenarios

### Scenario 1: Complete Billing Workflow

```bash
# 1. Initialize medicines
curl -X POST http://localhost:8008/pharmacy/initialize-sample-data

# 2. Get medicines
curl -X GET http://localhost:8008/pharmacy/medicines

# 3. Create bill
curl -X POST http://localhost:8008/pharmacy/billing \
  -H "Content-Type: application/json" \
  -d '{"registrationId":"REG-2025-999999","patientName":"Test Patient","items":[{"medicineId":"MEDICINE_ID","name":"Medicine Name","quantity":2,"price":100,"total":200}],"totalAmount":200,"paymentMethod":"cash"}'

# 4. Get patient bills
curl -X GET http://localhost:8008/pharmacy/billing/patient/REG-2025-999999

# 5. Check stock report
curl -X GET http://localhost:8008/pharmacy/stock-report
```

### Scenario 2: Error Handling

**Insufficient Stock:**
```bash
curl -X POST http://localhost:8008/pharmacy/billing \
  -H "Content-Type: application/json" \
  -d '{
    "registrationId": "REG-2025-123456",
    "patientName": "John Doe",
    "items": [
      {
        "medicineId": "507f1f77bcf86cd799439009",
        "name": "IOL (Intraocular Lens)",
        "quantity": 100,
        "price": 15000.0,
        "total": 1500000.0
      }
    ],
    "totalAmount": 1500000.0,
    "paymentMethod": "cash"
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Insufficient stock for IOL (Intraocular Lens). Available: 8, Requested: 100"
}
```

---

## PowerShell Examples

### For Windows Users

**Get Medicines:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8008/pharmacy/medicines" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Create Bill:**
```powershell
$bill = @{
    registrationId = "REG-2025-123456"
    patientName = "John Doe"
    items = @(
        @{
            medicineId = "507f1f77bcf86cd799439011"
            name = "Refresh Tears"
            quantity = 2
            price = 150.0
            total = 300.0
        }
    )
    totalAmount = 300.0
    paymentMethod = "cash"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8008/pharmacy/billing" `
  -Method Post `
  -ContentType "application/json" `
  -Body $bill | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

---

## Expected Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Bill created, medicines fetched |
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | Medicine/Bill not found |
| 500 | Server Error | Database connection issue |

---

## Monitoring & Debugging

### Check MongoDB Collections

```bash
# Using MongoDB shell
db.pharmacy_medicines.find().pretty()
db.pharmacy_billing.find().pretty()

# Count documents
db.pharmacy_medicines.countDocuments()
db.pharmacy_billing.countDocuments()
```

### Monitor Stock Changes

```bash
# Watch for stock changes
db.pharmacy_medicines.find({}, {name: 1, stock: 1, updated_at: 1})
```

### Verify Patient Bill History

```bash
# Find patient billing history
db.patients.findOne({registrationId: "REG-2025-123456"}, {pharmacyBills: 1})
```

---

## Performance Testing

### Load Testing Script (bash)

```bash
#!/bin/bash

echo "Testing medicine fetch..."
for i in {1..100}; do
  curl -s -X GET http://localhost:8008/pharmacy/medicines > /dev/null
  echo "Request $i completed"
done

echo "All tests completed"
```

---

## Troubleshooting API Issues

### Issue: 404 Medicine Not Found

**Check:**
1. Medicine ID is correct ObjectId format
2. Initialize sample data first with POST /pharmacy/initialize-sample-data
3. Verify MongoDB connection

### Issue: Billing Validation Errors

**Check:**
1. All item IDs are valid ObjectIds
2. Stock is sufficient for requested quantities
3. Registration ID is valid format

### Issue: Slow API Response

**Check:**
1. MongoDB is running and responsive
2. Network latency
3. Server load (check CPU/memory)

---

## Documentation References

- **OpenAPI Docs:** http://localhost:8008/docs
- **ReDoc Docs:** http://localhost:8008/redoc

---

**Last Updated:** December 10, 2025  
**API Version:** 1.0  
**Status:** ✅ Ready for Testing
