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
      // Get current Vietnam time
      const currentDate = new Date();
      const vietnamDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
      
      const payload = {
        customerId: Number((request.metadata as any)?.customerId || 0),
        persona: String((request.metadata as any)?.personalityName || 'Mentor'),
        sessionId: String(request.sessionId || ''),
        message: request.message || "",
        currentDate: vietnamDate.toISOString(),
        timezone: 'Asia/Ho_Chi_Minh',
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
            
            // Trigger dashboard refresh event
            window.dispatchEvent(new CustomEvent('planUpdated', {
              detail: { planId: plan.id, customerId }
            }));
            
            // Format và hiển thị kế hoạch chi tiết trong chat
            const formattedPlan = ChatAPI.formatPlanDisplay(plan, reply);
            return formattedPlan;
          } catch (e) {
            console.warn('Plan accept fallback failed:', e);
          }
        }

        // Kiểm tra nếu có plan trong response (kể cả khi chưa accept)
        if (plan && (planHint === 'proposed' || planHint === 'updated')) {
          // Trigger dashboard refresh event cho plan mới/cập nhật
          window.dispatchEvent(new CustomEvent('planUpdated', {
            detail: { planId: plan.id, customerId: Number((request.metadata as any)?.customerId || 0) }
          }));
          
          const formattedPlan = ChatAPI.formatPlanDisplay(plan, reply);
          return formattedPlan;
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

  // Format plan display for chat messages
  static formatPlanDisplay(plan: any, originalReply: string): string {
    if (!plan) return originalReply;

    try {
      let formattedPlan = originalReply + '\n\n**📋 Kế hoạch chi tiết:**\n\n';
      
      if (plan.title) {
        formattedPlan += `**${plan.title}**\n\n`;
      }

      if (plan.week_plan && Array.isArray(plan.week_plan)) {
        // Get current date in Vietnam timezone
        const currentDate = new Date();
        const vietnamDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
        
        plan.week_plan.forEach((week: any, index: number) => {
          // Calculate real date for each day
          const planDate = new Date(vietnamDate);
          planDate.setDate(vietnamDate.getDate() + index);
          
          const formattedDate = planDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          formattedPlan += `**• ${formattedDate}:**\n`;
          
          if (week.tasks && Array.isArray(week.tasks)) {
            week.tasks.forEach((task: string) => {
              formattedPlan += `  - ${task}\n`;
            });
          }
          
          if (week.amount) {
            formattedPlan += `  💰 Mục tiêu: **${week.amount}**\n`;
          }
          
          formattedPlan += '\n';
        });
      }

      if (plan.weekly_target) {
        formattedPlan += `💡 **Mục tiêu hàng tuần:** ${plan.weekly_target}\n\n`;
      }

      if (plan.total_target) {
        formattedPlan += `🎯 **Tổng mục tiêu:** ${plan.total_target}\n\n`;
      }

      formattedPlan += '✅ **Bạn có thể theo dõi tiến độ ở trang Dashboard!**';

      return formattedPlan;
    } catch (e) {
      console.warn('Error formatting plan display:', e);
      return originalReply;
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
