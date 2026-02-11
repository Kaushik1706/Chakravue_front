# Chakravue AI - Multi-Tenant SaaS Implementation

## Architecture Overview

### 1. Organization Signup Flow

#### Step 1: Signup Page (New Component)
```typescript
// OrganizationSignupView.tsx
- Organization Name
- Email
- Phone
- Industry (Healthcare, etc.)
- Expected Users (to determine plan)
- Country/Region
```

#### Step 2: Plan Selection
```
Plans:
- Starter: $99/month (5 users, 1GB storage)
- Professional: $299/month (20 users, 10GB storage)
- Enterprise: Custom pricing
```

#### Step 3: Payment Processing
- Stripe integration for payment
- Generate subscription ID after successful payment
- Create organization record in master database

---

## 2. Database Architecture

### Master Database (Admin MongoDB)
```javascript
// Collections in Master DB:
db.organizations.insertOne({
  _id: ObjectId,
  organizationName: "Hospital XYZ",
  email: "admin@hospitalxyz.com",
  subscriptionId: "sub_12345", // Stripe subscription ID
  plan: "professional",
  status: "active",
  mongoConnectionString: "mongodb+srv://user:pass@org-cluster.mongodb.net/hospitalxyz",
  createdAt: ISODate,
  expiresAt: ISODate,
  features: {
    maxUsers: 20,
    maxStorage: 10737418240, // 10GB in bytes
    enableAnalytics: true,
    enableReports: true
  }
})

db.users.insertOne({
  _id: ObjectId,
  organizationId: ObjectId,
  email: "doctor@hospitalxyz.com",
  role: "doctor",
  status: "active"
})
```

### Per-Organization Database (Individual MongoDB Atlas Cluster)
Each organization gets their own MongoDB cluster with:
```javascript
// Their own database with their own collections:
- patients
- appointments
- medicines
- users
- appointments_queue
- etc.
```

---

## 3. Implementation Steps

### Step 1: Create Organization Signup Backend API

```python
# backend/routes/organization.py

@app.post("/organization/signup")
async def signup_organization(org_data: dict):
    """
    1. Create organization in master DB
    2. Charge payment via Stripe
    3. Provision MongoDB Atlas cluster
    4. Create organization-specific database
    5. Return connection string and credentials
    """
    
    # 1. Validate input
    required_fields = ["organizationName", "email", "plan"]
    
    # 2. Create Stripe customer and subscription
    stripe_customer = stripe.Customer.create(
        email=org_data["email"],
        name=org_data["organizationName"]
    )
    
    stripe_subscription = stripe.Subscription.create(
        customer=stripe_customer.id,
        items=[{"price": PLAN_PRICES[org_data["plan"]]}]
    )
    
    # 3. Provision MongoDB Atlas cluster
    mongo_creds = provision_mongodb_cluster(org_data["organizationName"])
    
    # 4. Save organization in master database
    org_record = {
        "organizationName": org_data["organizationName"],
        "email": org_data["email"],
        "subscriptionId": stripe_subscription.id,
        "plan": org_data["plan"],
        "status": "active",
        "mongoConnectionString": mongo_creds["connectionString"],
        "mongoUsername": mongo_creds["username"],
        "mongoPassword": mongo_creds["password"],
        "createdAt": datetime.now(),
        "features": GET_PLAN_FEATURES(org_data["plan"])
    }
    
    master_db["organizations"].insert_one(org_record)
    
    # 5. Create admin user for organization
    admin_user = {
        "organizationId": org_record["_id"],
        "email": org_data["email"],
        "role": "admin",
        "status": "active",
        "createdAt": datetime.now()
    }
    
    master_db["users"].insert_one(admin_user)
    
    return {
        "success": True,
        "organizationId": str(org_record["_id"]),
        "message": "Organization created successfully. Check your email for login credentials."
    }


def provision_mongodb_cluster(org_name: str):
    """
    Use MongoDB Atlas API to create new cluster
    https://docs.atlas.mongodb.com/api/
    """
    import requests
    
    cluster_name = f"chakravue-{org_name.lower().replace(' ', '-')}"
    
    payload = {
        "name": cluster_name,
        "providerSettings": {
            "providerName": "AWS",
            "instanceSizeName": "M2",  # Starts small, can upgrade
            "regionName": "us-east-1"
        },
        "backupEnabled": True,
        "autoScaling": {
            "diskGBEnabled": True,
            "computeEnabled": True
        }
    }
    
    # Call MongoDB Atlas API
    response = requests.post(
        f"https://cloud.mongodb.com/api/atlas/v1.0/groups/{PROJECT_ID}/clusters",
        auth=(ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY),
        json=payload
    )
    
    # Create database user
    db_user = {
        "username": f"org_{org_name.lower()}",
        "password": generate_secure_password(),
        "roles": [{"roleName": "readWriteAnyDatabase", "databaseName": "admin"}]
    }
    
    # Create connection string
    connection_string = f"mongodb+srv://{db_user['username']}:{db_user['password']}@{cluster_name}.mongodb.net/{org_name.lower()}?retryWrites=true&w=majority"
    
    return {
        "clusterId": response.json()["id"],
        "clusterName": cluster_name,
        "username": db_user["username"],
        "password": db_user["password"],
        "connectionString": connection_string
    }
```

### Step 2: Create Organization Login

```python
# backend/routes/auth.py

@app.post("/auth/organization-login")
async def organization_login(email: str, password: str):
    """
    1. Find user in master database
    2. Get user's organization
    3. Get organization's MongoDB connection string
    4. Return both user and organization context
    """
    
    user = master_db["users"].find_one({"email": email})
    
    if not user or not verify_password(password, user["password_hash"]):
        return {"error": "Invalid credentials"}
    
    # Get organization details
    org = master_db["organizations"].find_one({"_id": user["organizationId"]})
    
    if org["status"] != "active":
        return {"error": "Organization subscription expired"}
    
    # Check if payment is due
    if org["expiresAt"] < datetime.now():
        return {"error": "Organization subscription expired. Please renew."}
    
    return {
        "success": True,
        "userId": str(user["_id"]),
        "organizationId": str(org["_id"]),
        "organizationName": org["organizationName"],
        "email": user["email"],
        "role": user["role"],
        "mongoConnectionString": org["mongoConnectionString"],  // Send securely
        "token": generate_jwt_token({
            "userId": str(user["_id"]),
            "organizationId": str(org["_id"]),
            "role": user["role"]
        })
    }
```

### Step 3: Update Frontend to Use Organization Context

```typescript
// App.tsx context management

interface OrganizationContext {
  organizationId: string;
  organizationName: string;
  mongoConnectionString: string;
  plan: "starter" | "professional" | "enterprise";
  features: PlanFeatures;
}

// On login, store:
const [currentOrganization, setCurrentOrganization] = useState<OrganizationContext>(null);

// All API calls should include organizationId:
const fetchAppointments = async (organizationId: string) => {
  const response = await fetch(
    `http://localhost:8008/appointments?organizationId=${organizationId}`
  );
}
```

### Step 4: Update Backend API to Support Multi-Tenant

```python
# backend/database.py - Connection management

class TenantDatabase:
    def __init__(self, organization_id: str):
        self.organization_id = organization_id
        # Get org from master DB
        org = master_db["organizations"].find_one({"_id": ObjectId(organization_id)})
        
        if not org:
            raise Exception("Organization not found")
        
        # Connect to org's own database
        self.client = MongoClient(org["mongoConnectionString"])
        self.db = self.client[org["organizationName"].lower().replace(" ", "_")]
    
    def get_appointments(self):
        return self.db["appointments"].find()
    
    def get_patients(self):
        return self.db["patients"].find()
    
    # ... etc for all collections


# Usage in routes:
@app.get("/appointments")
async def get_appointments(organization_id: str, token: str):
    # Verify token and organization
    verify_auth_token(token, organization_id)
    
    # Get tenant-specific DB
    tenant_db = TenantDatabase(organization_id)
    appointments = tenant_db.get_appointments()
    
    return {"appointments": list(appointments)}
```

---

## 4. Database Provisioning Options

### Option A: MongoDB Atlas (Recommended for SaaS)
- Automated backups
- Auto-scaling
- Global distribution
- Built-in monitoring
- Cost: ~$57/month per cluster (M2 tier)

### Option B: Self-hosted MongoDB
- More control
- Lower cost per cluster
- More operational overhead

### Option C: Hybrid (MongoDB + AWS/Azure)
- Use cloud provider's managed services
- Automatic failover
- Pay-as-you-go pricing

---

## 5. Stripe Integration for Payments

```python
# requirements.txt
stripe==5.10.0

# backend/stripe_integration.py

import stripe

stripe.api_key = "sk_live_your_key"

PLAN_PRICES = {
    "starter": "price_1234567890",
    "professional": "price_0987654321",
    "enterprise": "price_5555555555"
}

@app.post("/payment/create-checkout")
async def create_checkout(plan: str):
    """Create Stripe checkout session"""
    
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price": PLAN_PRICES[plan],
            "quantity": 1,
        }],
        mode="subscription",
        success_url="https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="https://yourdomain.com/canceled",
    )
    
    return {"checkoutUrl": session.url}

@app.post("/payment/webhook")
async def handle_stripe_webhook(request: Request):
    """Handle Stripe webhooks for subscription events"""
    
    event = stripe.Event.construct_from(
        json.loads(await request.body()), stripe.api_key
    )
    
    if event["type"] == "customer.subscription.created":
        subscription = event["data"]["object"]
        # Create organization
        create_organization(subscription)
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        # Deactivate organization
        deactivate_organization(subscription)
    
    return {"status": "success"}
```

---

## 6. Admin Dashboard (For You)

Track all organizations:
```
- Active Organizations
- Monthly Revenue
- Plan Distribution
- Usage Statistics
- Support Tickets
- Database Health
```

---

## 7. Security Considerations

1. **Never send MongoDB connection strings to frontend** - Only backend knows them
2. **Use JWT tokens** with organizationId claim
3. **Verify organizationId** on every API call
4. **Encrypt sensitive data** in master database
5. **Rate limiting** per organization
6. **Audit logging** for all operations

---

## 8. Deployment Timeline

1. **Week 1**: Stripe integration + signup page
2. **Week 2**: MongoDB Atlas provisioning automation
3. **Week 3**: Multi-tenant backend API updates
4. **Week 4**: Testing + security audit
5. **Week 5**: Launch beta with 5-10 organizations

---

## 9. Pricing Strategy

```
Starter ($99/month):
- 5 users
- 1GB storage
- Basic reports
- Email support

Professional ($299/month):
- 20 users
- 10GB storage
- Advanced analytics
- Priority support

Enterprise (Custom):
- Unlimited users
- Custom storage
- Dedicated server
- 24/7 support
- SLA guarantee
```

---

## Next Steps

1. Choose payment processor (Stripe recommended)
2. Set up MongoDB Atlas account + API keys
3. Design signup flow
4. Implement auth system
5. Create multi-tenant backend
6. Test with pilot organizations
