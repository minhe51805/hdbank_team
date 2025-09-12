# 🔐 HDBank Login Test Guide

## ✅ **Backend Server Status**
- **Authentication API**: Running on http://localhost:3001
- **Database**: PostgreSQL connected (500 user accounts ready)
- **CORS**: Configured for http://localhost:3000

## ✅ **Frontend Integration**
- **React App**: http://localhost:3000
- **AuthProvider**: Integrated with App.tsx
- **LoginPage**: Connected to authentication API

---

## 🧪 **TEST LOGIN CREDENTIALS**

### **Ready-to-use accounts:**

| Customer ID | Username | Password | Segment | Age | Income (VND) |
|-------------|----------|----------|---------|-----|--------------|
| 1 | hdbank0001 | HDFAM0012024@ | family | 48 | 9,475,780 |
| 2 | hdbank0002 | HDWRK0022024@ | worker | 32 | 10,641,996 |
| 5 | hdbank0005 | HDSTU0052024@ | student | 20 | 5,306,227 |
| 10 | hdbank0010 | HDWRK0102024@ | worker | 38 | 13,318,898 |

### **Password Pattern:**
```
HD[SegmentCode][CustomerID]2024@

Segment Codes:
- FAM = family
- WRK = worker
- STU = student
- SNR = senior
- OTH = other
```

---

## 🚀 **How to Test Login**

### **Step 1: Access Login Page**
1. Go to http://localhost:3000/login
2. Or click "Đăng nhập" button in header

### **Step 2: Test with Sample Account**
```
Username: hdbank0001
Password: HDFAM0012024@
```

### **Step 3: Expected Flow**
1. ✅ Form validation works
2. ✅ Loading spinner shows
3. ✅ API call to backend server
4. ✅ Authentication successful
5. ✅ Redirect to homepage (/vi)
6. ✅ User data stored in localStorage

---

## 🔧 **API Endpoints Available**

### **Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify` - Verify JWT token

### **Health Check:**
- `GET /health` - Server status
- `GET /api/test` - Database connection test

---

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"Không thể kết nối đến server"**
   - Check backend server: http://localhost:3001/health
   - Ensure PostgreSQL container is running

2. **"Tên đăng nhập hoặc mật khẩu không đúng"**
   - Verify username format: hdbank0001
   - Verify password format: HDFAM0012024@

3. **CORS Issues**
   - Backend configured for http://localhost:3000
   - Check browser console for CORS errors

### **Debug Commands:**
```bash
# Test backend health
curl http://localhost:3001/health

# Test database connection
curl http://localhost:3001/api/test

# Test login API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"hdbank0001","password":"HDFAM0012024@"}'
```

---

## 📱 **User Experience**

### **Login Process:**
1. User enters credentials
2. Form validation (client-side)
3. Loading state with spinner
4. API authentication (server-side)
5. JWT token stored
6. Redirect to dashboard
7. Auth state persistent

### **Security Features:**
- ✅ bcrypt password hashing
- ✅ JWT token authentication
- ✅ Account lockout after failed attempts
- ✅ Secure session management

---

## 🎯 **Next Steps**

After successful login test:
1. **Customer Dashboard** - Show user profile & banking data
2. **Protected Routes** - Add authentication guards
3. **User Profile** - Display customer insights from ML model
4. **Logout Functionality** - Clear session and redirect

---

**🎉 READY TO TEST! Try logging in with hdbank0001 / HDFAM0012024@** ✨
