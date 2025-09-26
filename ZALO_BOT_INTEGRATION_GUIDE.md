# 🤖 HDBank CashyBear x Zalo Bot Integration Guide

## 🎯 **Tổng quan**

Tích hợp CashyBear (AI Financial Assistant) với Zalo Bot để cung cấp dịch vụ tư vấn tài chính qua Zalo.

### **Kiến trúc hệ thống:**
```
Zalo User → Zalo Bot → Webhook Server → CashyBear API → PostgreSQL
                ↓                              ↓
            Tailscale Funnel               FastAPI (port 8010)
            (HTTPS public)                 (Jupyter notebook)
```

---

## 🚀 **Bước 1: Chuẩn bị môi trường**

### **1.1 Cài đặt dependencies:**
```bash
pip install fastapi uvicorn requests python-multipart
```

### **1.2 Kiểm tra CashyBear API:**
```bash
# Đảm bảo CashyBear đang chạy trên port 8010
curl http://127.0.0.1:8010/health
```

### **1.3 Cài đặt Tailscale:**
- Tải và cài đặt Tailscale: https://tailscale.com/download
- Đăng nhập và kết nối máy vào Tailscale network

---

## 🔧 **Bước 2: Khởi động hệ thống**

### **2.1 Khởi động CashyBear API:**
1. Mở `CashyBear_Persona_Chatbot.ipynb` trong Jupyter
2. Chạy tất cả cells để khởi động FastAPI server
3. Xác nhận server chạy trên port 8010

### **2.2 Khởi động Webhook Server:**
```bash
# Phương án 1: Dùng script tự động
python start_zalo_integration.py

# Phương án 2: Khởi động thủ công
python zalo_bot_integration.py
```

### **2.3 Expose webhook với Tailscale:**
```bash
# Expose webhook server ra internet
tailscale funnel --https=443 localhost:8011
```

Lệnh này sẽ cho bạn URL public như:
```
https://your-machine-name.tail-scale.ts.net
```

---

## 🌐 **Bước 3: Setup Zalo Bot Webhook**

### **3.1 Lấy webhook URL:**
Webhook URL sẽ có format:
```
https://your-machine-name.tail-scale.ts.net/webhook
```

### **3.2 Cấu hình webhook:**
```bash
# Dùng script setup
python setup_zalo_webhook.py set https://your-machine-name.tail-scale.ts.net/webhook

# Hoặc test trước
python setup_zalo_webhook.py info
```

### **3.3 Verify webhook:**
```bash
# Kiểm tra webhook đã được set
python setup_zalo_webhook.py info

# Response thành công:
{
  "ok": true,
  "url": "https://your-machine-name.tail-scale.ts.net/webhook",
  "allowed_updates": ["message"]
}
```

---

## 🧪 **Bước 4: Test Integration**

### **4.1 Test cục bộ:**
```bash
# Test CashyBear API
curl -X POST http://127.0.0.1:8010/chat/reply \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "persona": "Mentor", 
    "sessionId": "test-session",
    "message": "Tôi muốn tiết kiệm 1 triệu trong 7 ngày"
  }'

# Test Webhook server
curl http://127.0.0.1:8011/health
```

### **4.2 Test qua Zalo:**
1. Tìm bot của bạn trên Zalo (dùng bot creator)
2. Gửi tin nhắn: "Xin chào"
3. Bot sẽ trả lời qua CashyBear API

### **4.3 Test kế hoạch tiết kiệm:**
```
User: "Tôi muốn tiết kiệm 500k trong 7 ngày"
Bot: [CashyBear sẽ phân tích và đưa ra kế hoạch chi tiết]

User: "Đồng ý"  
Bot: "Tuyệt! Mình đã ghi nhận kế hoạch..."
```

---

## 🔗 **API Endpoints**

### **CashyBear API (port 8010):**
- `GET /health` - Health check
- `POST /chat/reply` - Chat với AI
- `POST /plan/propose` - Đề xuất kế hoạch
- `POST /plan/accept` - Chấp nhận kế hoạch
- `GET /dashboard/todo` - Lấy todo list

### **Webhook Server (port 8011):**
- `GET /health` - Health check  
- `POST /webhook` - Zalo webhook endpoint
- `POST /set_user_mapping` - Map Zalo user → Customer ID
- `GET /user_mappings` - Xem user mappings

### **Zalo Bot API:**
- `POST /bot/{token}/setWebhook` - Set webhook URL
- `GET /bot/{token}/getWebhookInfo` - Get webhook info  
- `POST /bot/{token}/sendMessage` - Send message to user

---

## 🛠️ **Cấu hình nâng cao**

### **5.1 Mapping Users:**
```bash
# Map Zalo user ID với HDBank customer ID
curl -X POST http://127.0.0.1:8011/set_user_mapping \
  -H "Content-Type: application/json" \
  -d '{
    "zalo_user_id": "123456789",
    "customer_id": 42
  }'
```

### **5.2 Thay đổi Persona mặc định:**
Sửa trong `zalo_bot_integration.py`:
```python
# Default persona, could be configurable per user
persona="Banter"  # hoặc "Angry Mom"
```

### **5.3 Custom responses:**
Có thể customize response format trong hàm `call_cashybear_api()`.

---

## 🐛 **Troubleshooting**

### **Lỗi thường gặp:**

#### **1. CashyBear API không chạy:**
```bash
# Kiểm tra port
netstat -an | grep 8010

# Restart notebook
# Mở lại CashyBear_Persona_Chatbot.ipynb và chạy lại
```

#### **2. Webhook server lỗi:**
```bash
# Kiểm tra log
python zalo_bot_integration.py

# Kiểm tra port conflict
netstat -an | grep 8011
```

#### **3. Tailscale không hoạt động:**
```bash
# Kiểm tra Tailscale status
tailscale status

# Restart funnel
tailscale funnel --https=443 localhost:8011
```

#### **4. Zalo Bot không nhận webhook:**
```bash
# Kiểm tra webhook status
python setup_zalo_webhook.py info

# Reset webhook
python setup_zalo_webhook.py delete
python setup_zalo_webhook.py set https://your-url.com/webhook
```

### **Debug logs:**
```bash
# Xem log chi tiết
tail -f zalo_webhook.log

# Test webhook trực tiếp
curl -X POST https://your-machine-name.tail-scale.ts.net/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "message": {"text": "hello test"}
  }'
```

---

## 📊 **Monitoring & Logs**

### **Health checks:**
```bash
# Kiểm tra tất cả services
curl http://127.0.0.1:8010/health  # CashyBear
curl http://127.0.0.1:8011/health  # Webhook
curl https://your-domain.com/health  # Public endpoint
```

### **Log locations:**
- CashyBear: Jupyter notebook output
- Webhook: Console output hoặc log file
- Zalo API: Response trong webhook calls

---

## 🎯 **Kết quả mong đợi**

Sau khi setup thành công:

1. ✅ **User gửi tin nhắn** qua Zalo Bot
2. ✅ **Webhook server** nhận được message
3. ✅ **CashyBear API** xử lý và trả về response
4. ✅ **Zalo Bot** gửi reply về cho user
5. ✅ **Database** lưu chat history và plans

### **Sample conversation:**
```
👤 User: "Xin chào CashyBear"
🤖 Bot: "Chào bạn! Mình là CashyBear (Mentor). Bạn muốn đặt mục tiêu tiết kiệm nào để mình cùng lên kế hoạch 7/14 ngày trước nhé?"

👤 User: "Tôi muốn tiết kiệm 1 triệu trong 7 ngày"  
🤖 Bot: [Kế hoạch chi tiết 7 ngày với các task cụ thể]

👤 User: "Đồng ý"
🤖 Bot: "Tuyệt! Mình đã ghi nhận kế hoạch. Bạn có thể theo dõi tiến độ ở Dashboard To‑do."
```

---

## 🚀 **Next Steps**

1. **Production deployment**: Sử dụng proper server thay vì Tailscale
2. **User authentication**: Tích hợp với HDBank customer database
3. **Multi-persona**: Cho phép user chọn personality
4. **Rich media**: Hỗ trợ hình ảnh, file đính kèm
5. **Analytics**: Track usage và performance metrics

---

**🎉 Integration hoàn tất! Zalo Bot của bạn giờ đã được tích hợp với CashyBear AI!** ✨

### **📞 Support:**
- **Zalo Bot Documentation**: https://bot.zapps.me/docs/
- **CashyBear API**: Xem notebook documentation
- **Issues**: Check console logs và health endpoints
