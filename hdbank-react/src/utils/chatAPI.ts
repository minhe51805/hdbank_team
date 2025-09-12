// HDBank ChatBot API Service
// Connect to n8n webhook from New folder project

import ChatConfig from '../config/chatConfig';

const N8N_CHAT_URL = ChatConfig.N8N_CHAT_URL;

interface ChatRequest {
  message: string;
  sessionId: string;
  userId?: string;
  personalityPrompt?: string;
  metadata?: Record<string, any>;
}

interface ChatResponse {
  output?: string;
  reply?: string;
  message?: string;
  result?: string;
  error?: string;
  detail?: string;
}

export class ChatAPI {
  static async sendMessage(request: ChatRequest): Promise<string> {
    try {
      const payload = {
        message: request.message || "",
        sessionId: request.sessionId || crypto.randomUUID(),
        userId: request.userId || "hdbank-web-user",
        metadata: {
          source: "hdbank-react",
          personalityPrompt: request.personalityPrompt,
          platform: "web",
          timestamp: new Date().toISOString(),
          ...request.metadata
        },
      };

      console.log('Sending to n8n:', payload);

      const response = await fetch(N8N_CHAT_URL, {
        method: "POST",
        headers: { 
          "content-type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log('n8n raw response:', text);

      let data: ChatResponse;
      try {
        data = JSON.parse(text);
      } catch {
        // If not JSON, treat as plain text response
        return text || "Đã nhận được phản hồi từ HDBank AI.";
      }

      // Parse n8n response format
      let reply: string;
      if (data?.output) {
        reply = data.output;
      } else if (data?.reply) {
        reply = data.reply;
      } else if (data?.message) {
        reply = data.message;
      } else if (data?.result) {
        reply = data.result;
      } else if (data?.error) {
        throw new Error(data.error + (data.detail ? `: ${data.detail}` : ''));
      } else {
        reply = "Cảm ơn bạn đã liên hệ HDBank. Tôi đã nhận được tin nhắn của bạn.";
      }

      return String(reply);

    } catch (error: any) {
      console.error('ChatAPI Error:', error);
      
      // User-friendly error messages
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Không thể kết nối đến HDBank AI. Vui lòng kiểm tra kết nối mạng.');
      } else if (error?.message?.includes('CORS')) {
        throw new Error('Lỗi bảo mật CORS. Vui lòng liên hệ hỗ trợ kỹ thuật.');
      } else if (error?.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.');
      }
    }
  }

  // Test connection to n8n
  static async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendMessage({
        message: "test connection",
        sessionId: "test-session-" + Date.now(),
        userId: "test-user",
        personalityPrompt: "Just respond with 'connection ok'"
      });
      
      console.log('Connection test response:', response);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export for easy use
export default ChatAPI;
