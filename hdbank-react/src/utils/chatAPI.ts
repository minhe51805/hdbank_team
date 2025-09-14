// HDBank ChatBot API Service
// Connect to n8n webhook from New folder project

import ChatConfig from '../config/chatConfig';

const NOTEBOOK_API = ChatConfig.NOTEBOOK_API_URL;

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
        customerId: Number((request.metadata as any)?.customerId || 0),
        persona: String((request.metadata as any)?.personalityName || 'Mentor'),
        sessionId: String(request.sessionId || ''),
        message: request.message || "",
        // history được lưu ở server theo sessionId, không gửi từ FE để tránh lệch state
      };

      console.log('Sending to CashyBear API:', payload);

      const response = await fetch(`${NOTEBOOK_API}/chat/reply`, {
        method: "POST",
        headers: { 
          "content-type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log('CashyBear raw response:', text);

      let reply = text;
      try {
        const data = JSON.parse(text);
        reply = data?.reply ?? reply;

        // Auto-accept: nếu server báo đã accepted, chủ động gọi /plan/accept để đảm bảo lưu vào DB
        const planHint = (data as any)?.planHint as string | undefined;
        const plan = (data as any)?.plan;
        const personaName = String((request as any)?.metadata?.personalityName || 'Mentor');
        const customerId = Number((request.metadata as any)?.customerId || 0);
        if (planHint === 'accepted' && plan && customerId) {
          try {
            await fetch(`${NOTEBOOK_API}/plan/accept`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ customerId, persona: personaName, plan })
            });
            console.log('Plan accepted & persisted via FE');
          } catch (e) {
            console.warn('Plan accept fallback failed:', e);
          }
        }
      } catch {}

      return String(reply || "Đã nhận được phản hồi từ CashyBear.");

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
      const res = await fetch(`${NOTEBOOK_API}/health`);
      const ok = res.ok;
      console.log('Connection test response:', ok);
      return ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export for easy use
export default ChatAPI;
