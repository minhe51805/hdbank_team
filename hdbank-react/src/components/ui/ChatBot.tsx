import React, { useEffect, useRef, useState } from "react";
import ChatAPI from '../../utils/chatAPI';
import './ChatBot.css';

interface Message { 
  role: "user" | "assistant"; 
  content: string; 
  isTyping?: boolean;
}

interface BankingPersonality {
  id: string;
  name: string;
  description: string;
  prompt: string;
  initialMessage: string;
  emoji: string;
  color: string;
}

const bankingPersonalities: BankingPersonality[] = [
  {
    id: "mentor",
    name: "Mentor",
    description: "Lịch sự, chuyên nghiệp, giải thích từng bước rõ ràng",
    prompt: "Bạn là CashyBear – Gấu nhắc tiết kiệm, ví bạn thêm xịn. Phong cách Mentor: lịch sự, chuyên nghiệp, giải thích từng bước rõ ràng, định hướng hành động.",
    initialMessage: "Chào bạn! Mình là CashyBear (Mentor). Bạn muốn đặt mục tiêu tiết kiệm nào để mình cùng lên kế hoạch 7/14 ngày trước nhé?",
    emoji: "🧠",
    color: "#be1128"
  },
  {
    id: "angry_mom",
    name: "Angry Mom",
    description: "Nghiêm khắc, càu nhàu nhưng quan tâm, bảo vệ ví",
    prompt: "Bạn là CashyBear – phong cách Angry Mom: thẳng, càu nhàu nhưng quan tâm; mục tiêu là bảo vệ ví người dùng.",
    initialMessage: "Vào việc nhé! Cho mình biết mục tiêu và thời gian, mình chốt cho bạn kế hoạch 7/14 ngày trước, làm được thì đi tiếp.",
    emoji: "🧹",
    color: "#2563eb"
  },
  {
    id: "banter",
    name: "Banter",
    description: "Gen Z vui vẻ, trêu nhẹ, emoji vừa đủ",
    prompt: "Bạn là CashyBear – phong cách Banter: thân thiện, hài hước, trêu nhẹ để khích lệ thay đổi thói quen tiền bạc.",
    initialMessage: "Hello bạn! CashyBear đây 😎 Cho mình biết mục tiêu tiền bạc của bạn nè, lên plan 7/14 ngày trước cho gọn.",
    emoji: "😄",
    color: "#16a34a"
  }
];

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<BankingPersonality | null>(null);
  const [showPersonalities, setShowPersonalities] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  useEffect(() => {
    setSessionId(crypto.randomUUID());
    
    // Test connection to n8n API
    const testConnection = async () => {
      try {
        const isConnected = await ChatAPI.testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'failed');
        if (isConnected) {
          console.log('✅ HDBank ChatBot connected to n8n API');
        } else {
          console.warn('⚠️ HDBank ChatBot connection test failed');
        }
      } catch (error) {
        console.error('❌ HDBank ChatBot connection error:', error);
        setConnectionStatus('failed');
      }
    };
    
    testConnection();
  }, []);

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo({ 
      top: viewportRef.current.scrollHeight, 
      behavior: "smooth" 
    });
  }, [messages]);

  const formatMessage = (content: string) => {
    if (!content) return content;
    
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|\n)(\d+\.)\s+(.+?)(?=\n\d+\.|\n[^0-9]|\n$|$)/g, 
        '$1<div class="list-item"><strong>$2</strong> $3</div>')
      .replace(/(^|\n)[\*\-\•]\s+(.+?)(?=\n[\*\-\•]|\n[^\*\-\•]|\n$|$)/g, 
        '$1<div class="bullet-item">• $2</div>')
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    if (!formatted.includes('<div class="list-item">') && !formatted.includes('<div class="bullet-item">')) {
      formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
  };

  const TypewriterText = ({ text, speed = 25, onComplete }: { 
    text: string; 
    speed?: number; 
    onComplete?: () => void;
  }) => {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
      if (text === "..." || text === "Đang soạn tin nhắn") {
        setDisplayText(text);
        setIsComplete(true);
        return;
      }

      setDisplayText("");
      setIsComplete(false);
      let index = 0;

      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          onComplete?.();
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
      <div 
        dangerouslySetInnerHTML={{ __html: formatMessage(displayText) }}
        data-typing={!isComplete && text !== "..." && text !== "Đang soạn tin nhắn" ? "true" : undefined}
      />
    );
  };

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      alert('Vui lòng đăng nhập trước khi chat để mình đọc đúng dữ liệu của bạn.');
      return;
    }
    setInput("");
    const userMessageIndex = messages.length;
    const aiMessageIndex = userMessageIndex + 1;
    
    setMessages(m => [...m, { role: "user", content: text }]);
    setBusy(true);
    
    setMessages(m => [...m, { role: "assistant", content: "...", isTyping: false }]);
    
    try {
      // Call real n8n API from New folder project
      const customerId = localStorage.getItem('customerId') || undefined;
      const apiResponse = await ChatAPI.sendMessage({
        message: text,
        sessionId: sessionId,
        userId: "hdbank-web-user",
        personalityPrompt: selectedPersonality?.prompt,
        metadata: {
          personality: selectedPersonality?.id,
          personalityName: selectedPersonality?.name,
          customerId
        }
      });

      setMessages(m => {
        const newMessages = [...m];
        newMessages[aiMessageIndex] = { 
          role: "assistant", 
          content: apiResponse, 
          isTyping: true 
        };
        return newMessages;
      });
      
      setTypingMessageIndex(aiMessageIndex);
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    } catch (err: any) {
      setMessages(m => {
        const newMessages = [...m];
        newMessages[aiMessageIndex] = { 
          role: "assistant", 
          content: `⚠️ Lỗi: ${String(err?.message ?? err)}`, 
          isTyping: true 
        };
        return newMessages;
      });
      
      setTypingMessageIndex(aiMessageIndex);
    } finally {
      setBusy(false);
    }
  }

  const selectPersonality = (personality: BankingPersonality) => {
    setSelectedPersonality(personality);
    // Reset session when switching persona to ensure clean server-side state
    setSessionId(crypto.randomUUID());
    setMessages([{ 
      role: "assistant", 
      content: personality.initialMessage, 
      isTyping: false 
    }]);
    setShowPersonalities(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
      if (!selectedPersonality) {
        setShowPersonalities(true);
      }
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className={`hdbank-chat-button ${hasNewMessage ? 'has-notification' : ''}`} onClick={toggleChat}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {hasNewMessage && <div className="hdbank-notification-dot"></div>}
          </>
        )}
      </div>

      {/* Chat Window */}
      <div className={`hdbank-chat-window ${isOpen ? 'open' : ''}`}>
        {showPersonalities && !selectedPersonality ? (
          <div className="hdbank-personality-selection">
            <div className="hdbank-chat-header">
              <div className="hdbank-chat-info">
                <div className="hdbank-logo">HD</div>
                <div>
                  <div className="hdbank-chat-title">HDBank Assistant</div>
                  <div className="hdbank-chat-status">Chọn trợ lý phù hợp</div>
                </div>
              </div>
              <button className="hdbank-close-button" onClick={toggleChat}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="hdbank-personality-list">
              <h3>Chọn trợ lý HDBank:</h3>
              {bankingPersonalities.map((personality) => (
                <button
                  key={personality.id}
                  className="hdbank-personality-card"
                  onClick={() => selectPersonality(personality)}
                  style={{ borderLeftColor: personality.color }}
                >
                  <div className="hdbank-personality-emoji">{personality.emoji}</div>
                  <div className="hdbank-personality-content">
                    <div className="hdbank-personality-name">{personality.name}</div>
                    <div className="hdbank-personality-description">{personality.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="hdbank-chat-header">
              <div className="hdbank-chat-info">
                <div 
                  className="hdbank-avatar" 
                  style={{ backgroundColor: selectedPersonality?.color }}
                >
                  {selectedPersonality?.emoji || 'HD'}
                </div>
                <div>
                  <div className="hdbank-chat-title">
                    {selectedPersonality?.name || 'HDBank Assistant'}
                  </div>
                  <div className="hdbank-chat-status">Online • Hỗ trợ 24/7</div>
                </div>
              </div>
              <div className="hdbank-chat-actions">
                {selectedPersonality && (
                  <button 
                    className="hdbank-change-personality"
                    onClick={() => setShowPersonalities(true)}
                    title="Đổi trợ lý"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </button>
                )}
                <button className="hdbank-close-button" onClick={toggleChat}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="hdbank-chat-transcript" ref={viewportRef}>
              {messages.map((m, i) => {
                const messageLength = m.content.length;
                const isShortMessage = messageLength < 100;
                const isLongMessage = messageLength > 400;
                
                let displayContent = m.content;
                
                if (m.content === "...") {
                  displayContent = "Đang soạn tin nhắn";
                }
                
                let sizeClass = '';
                if (isShortMessage) sizeClass = 'short';
                else if (isLongMessage) sizeClass = 'long';
                else sizeClass = 'medium';
                
                const shouldUseTypewriter = m.role === "assistant" && m.isTyping && typingMessageIndex === i;
                
                return (
                  <div key={i} className={`hdbank-chat-message ${m.role} ${sizeClass}`}>
                    {shouldUseTypewriter ? (
                      <TypewriterText 
                        text={displayContent}
                        speed={25}
                        onComplete={() => {
                          setMessages(msgs => {
                            const updated = [...msgs];
                            updated[i] = { ...updated[i], isTyping: false };
                            return updated;
                          });
                          setTypingMessageIndex(null);
                        }}
                      />
                    ) : (
                      <div 
                        data-typing={m.content === "..." ? "true" : undefined}
                        dangerouslySetInnerHTML={{ __html: formatMessage(displayContent) }} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="hdbank-chat-input-area">
              <input
                className="hdbank-chat-input"
                placeholder={busy ? "Đang xử lý…" : "Nhập câu hỏi của bạn..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={busy || !selectedPersonality}
              />
              <button 
                className="hdbank-send-button" 
                onClick={send} 
                disabled={busy || !input.trim() || !selectedPersonality}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </button>
            </div>
            
            <div className="hdbank-chat-footer">
              HDBank Assistant • Session: {sessionId ? sessionId.slice(0,6) : '...'} 
              <span className={`connection-status ${connectionStatus}`}>
                {connectionStatus === 'checking' && '🔄 Connecting...'}
                {connectionStatus === 'connected' && '🟢 Online'}  
                {connectionStatus === 'failed' && '🔴 Offline'}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatBot;
