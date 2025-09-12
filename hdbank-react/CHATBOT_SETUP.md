# HDBank ChatBot Setup Guide

## 🚀 Kết nối với n8n API từ "New folder" project

ChatBot này đã được setup để connect với n8n API tại: [https://laptop-jfecre1c.tail0882b7.ts.net/](https://laptop-jfecre1c.tail0882b7.ts.net/)

### 📁 Files đã được tạo:

1. **`src/utils/chatAPI.ts`** - API service để gọi n8n webhook
2. **`src/config/chatConfig.ts`** - Configuration settings  
3. **`src/components/ui/ChatBot.tsx`** - Updated để sử dụng real API
4. **`src/components/ui/ChatBot.css`** - Enhanced UI với connection status

### 🔧 Setup Steps:

#### 1. Environment Variables (Optional)
Tạo file `.env` trong root directory:
```env
# HDBank ChatBot Environment Variables
REACT_APP_N8N_CHAT_URL=https://laptop-jfecre1c.tail0882b7.ts.net/webhook/2c709ae7-230d-442a-9424-bbcbb8c2bdb0/chat
REACT_APP_ENV=development
REACT_APP_APP_NAME=HDBank_ChatBot
```

**Note:** Nếu không tạo `.env`, app sẽ dùng default URL trong `chatConfig.ts`

#### 2. Restart Development Server
```bash
npm start
```

#### 3. Test Connection
- Open browser console (F12)  
- Look for connection status:
  - ✅ `HDBank ChatBot connected to n8n API` 
  - ⚠️ `HDBank ChatBot connection test failed`
  - ❌ `HDBank ChatBot connection error`

### 🎯 Features

#### API Integration:
- **Real-time connection** với n8n webhook
- **Session management** với unique session IDs
- **Personality prompt** forwarding
- **Error handling** với user-friendly messages
- **Connection status** indicator trong UI

#### Payload Format gửi đến n8n:
```json
{
  "message": "User message",
  "sessionId": "uuid-session-id", 
  "userId": "hdbank-web-user",
  "metadata": {
    "source": "hdbank-react",
    "personalityPrompt": "AI personality instruction",
    "personality": "advisor|support|friendly", 
    "personalityName": "Chuyên viên tư vấn",
    "platform": "web",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Response Handling:
App sẽ parse response theo format từ n8n:
- `data.output` (primary)
- `data.reply` 
- `data.message`
- `data.result`
- `data.error` (for error cases)

### 🐛 Debugging

#### Connection Issues:
1. **CORS Error**: n8n server needs CORS headers enabled
2. **Network Error**: Check if n8n server is running
3. **Response Format**: Check console logs for API responses

#### Console Commands:
```javascript
// Test connection manually
ChatAPI.testConnection()

// Send test message  
ChatAPI.sendMessage({
  message: "Hello HDBank",
  sessionId: "test-123",
  personalityPrompt: "Be helpful"
})
```

### 🔄 Connection Status

UI shows real-time connection status:
- 🔄 **Connecting...** - Testing connection on load
- 🟢 **Online** - Connected to n8n API  
- 🔴 **Offline** - Connection failed

### 🎨 Banking Personalities

3 personalities được gửi đến n8n:
1. **👨‍💼 Chuyên viên tư vvánt** - Professional banking advisor
2. **🛠️ Hỗ trợ khách hàng** - Customer support specialist  
3. **😊 Trợ lý thân thiện** - Friendly financial assistant

### 📱 Usage

1. User clicks floating chat button
2. Selects personality → sends `initialMessage` 
3. User types message → calls `ChatAPI.sendMessage()`
4. Response displayed with typewriter effect
5. Full conversation history maintained

### 🚨 Error Handling

- **Network errors** → User-friendly message
- **CORS errors** → Technical support notification
- **API errors** → Error message from n8n
- **Timeout** → Connection timeout message

### 🔧 Customization

#### To change n8n URL:
1. Update `REACT_APP_N8N_CHAT_URL` in `.env`
2. OR update `N8N_CHAT_URL` in `src/config/chatConfig.ts`

#### To modify personalities:
Edit `bankingPersonalities` array in `src/components/ui/ChatBot.tsx`

#### To customize UI:
Modify styles in `src/components/ui/ChatBot.css`

---

## ✅ Setup Complete!

ChatBot bây giờ đã sẵn sàng connect với n8n API từ "New folder" project. 

**Test ngay:** Click vào floating chat button và thử chat với AI! 🤖
