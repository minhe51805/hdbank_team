# HDBank Customer Accounts - Login Credentials

## 🎯 **THÀNH CÔNG! Đã tạo 500 tài khoản khách hàng HDBank**

### 📊 **Database Statistics:**
- **Total Users**: 500 accounts
- **Active Users**: 500 accounts  
- **Customer Profiles**: 500 records
- **Customer Labels**: 500 records
- **Propensity Predictions**: 100 records

---

## 🔑 **Login Credential Format**

### **Username Pattern:**
```
hdbank[CustomerID padded to 4 digits]
Examples: hdbank0001, hdbank0002, hdbank0500
```

### **Email Pattern:**
```
customer[CustomerID padded to 4 digits]@customers.hdbank.vn
Examples: customer0001@customers.hdbank.vn
```

### **Phone Pattern:**
```
0908[CustomerID padded to 6 digits]
Examples: 0908000001, 0908000002
```

### **Password Pattern:**
```
HD[SegmentCode][CustomerID padded to 3 digits]2024@

Segment Codes:
- FAM = family
- WRK = worker  
- STU = student
- SNR = senior
- OTH = other

Examples:
- HDFAM0012024@ (Customer 1, family segment)
- HDWRK0022024@ (Customer 2, worker segment)
- HDSTU0052024@ (Customer 5, student segment)
```

---

## 🧪 **Sample Test Accounts**

| Customer ID | Username | Password | Email | Phone | Segment | Age |
|-------------|----------|----------|-------|-------|---------|-----|
| 1 | hdbank0001 | HDFAM0012024@ | customer0001@customers.hdbank.vn | 0908000001 | family | 48 |
| 2 | hdbank0002 | HDWRK0022024@ | customer0002@customers.hdbank.vn | 0908000002 | worker | 32 |
| 5 | hdbank0005 | HDSTU0052024@ | customer0005@customers.hdbank.vn | 0908000005 | student | 20 |
| 10 | hdbank0010 | HDWRK0102024@ | customer0010@customers.hdbank.vn | 0908000010 | worker | 38 |

---

## 💰 **Customer Segments Overview**

Based on customer_profiles data, users are categorized into:

1. **Family Customers** - Complete banking solutions
2. **Worker Customers** - Salary and loan products  
3. **Student Customers** - Educational financing
4. **Senior Customers** - Retirement planning
5. **Other Customers** - General banking services

---

## 🔐 **Security Features**

### **Password Security:**
- ✅ **bcrypt hashing** with 12 salt rounds
- ✅ **Complex passwords** with segments, numbers, symbols
- ✅ **Unique passwords** for each customer
- ✅ **Force password change** on first login

### **Account Security:**
- ✅ **Account lockout** after failed attempts
- ✅ **Session management** with JWT tokens
- ✅ **Active status** tracking
- ✅ **Login attempt** monitoring

---

## 🏦 **Customer Data Integration**

Each user account is linked to:

### **Customer Profile (40+ features):**
- Demographics (age, segment)
- Financial data (income, spend, balance)
- Banking behavior (digital_logins, transactions)
- Risk metrics (DTI, cashflow_volatility)
- Spending patterns (travel, food, utilities, etc.)

### **Customer Labels:**
- Interest prediction labels (0/1)
- Product propensity indicators

### **AI Propensity Analysis:**
- ML probability scores (0-1)
- Decision categories (Hot/Warm/Cold)
- AI-generated insights and explanations

---

## 🚀 **Usage Instructions**

### **1. Testing Login:**
```bash
# Use any of the 500 accounts
Username: hdbank0001
Password: HDFAM0012024@
```

### **2. Database Queries:**
```sql
-- Get user info
SELECT * FROM users WHERE username = 'hdbank0001';

-- Get customer profile
SELECT * FROM customer_profiles WHERE customer_id = 1;

-- Get propensity score
SELECT * FROM customer_propensity WHERE customer_id = 1;
```

### **3. API Authentication:**
```javascript
// Test login API call
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'hdbank0001',
    password: 'HDFAM0012024@'
  })
});
```

---

## 📞 **Support Information**

- **Database**: PostgreSQL port 5435
- **Total Records**: 500 customers with complete profiles
- **Data Source**: ML-processed customer features
- **Security**: Production-ready with bcrypt hashing

---

**🎉 500 HDBank customer accounts sẵn sàng để test và integrate với React frontend!** ✨
