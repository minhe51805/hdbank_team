import React, { useEffect, useRef, useState } from "react";
import ChatAPI from '../../utils/chatAPI';
import { useChat } from '../../contexts/ChatContext';
import { BankingPersonality, bankingPersonalities } from './PersonalitySelector';
import './ChatBot.css';

interface Message { 
  role: "user" | "assistant"; 
  content: string; 
  isTyping?: boolean;
}

const ChatBot: React.FC = () => {
  // Use global chat context instead of local state
  const {
    messages,
    setMessages,
    sessionId,
    setSessionId,
    selectedPersonality,
    setSelectedPersonality,
    isOpen,
    setIsOpen,
    hasNewMessage,
    setHasNewMessage,
    busy,
    setBusy,
    typingMessageIndex,
    setTypingMessageIndex,
    showPersonalities,
    setShowPersonalities,
    connectionStatus,
    setConnectionStatus
  } = useChat();

  const [input, setInput] = useState("");

  // Helper function to emit plan update events
  const emitPlanUpdateEvent = (messageContent: string) => {
    // Check if the message indicates a plan update/acceptance
    const planUpdateKeywords = [
      'kế hoạch đã được tạo',
      'plan đã được tạo', 
      'đã chấp nhận',
      'kế hoạch mới',
      'plan mới',
      'cập nhật kế hoạch',
      'tiết kiệm thành công',
      'hoàn thành mục tiêu',
      'đã lưu kế hoạch',
      'chấp nhận kế hoạch',
      'xác nhận kế hoạch',
      'plan được lưu',
      'kế hoạch tiết kiệm',
      'mục tiêu đã được',
      'đã tạo plan'
    ];
    
    const hasKeyword = planUpdateKeywords.some(keyword => 
      messageContent.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      console.log('🔄 Plan update detected, emitting refresh event');
      // Emit custom event to notify other components
      window.dispatchEvent(new CustomEvent('hdbank:planUpdate', {
        detail: { timestamp: new Date(), source: 'chatbot' }
      }));
    }
  };

  useEffect(() => {
    // Only create new session if one doesn't exist
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
    
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
      
      // Check if this message indicates a plan update and emit event
      emitPlanUpdateEvent(apiResponse);
      
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
            <img 
              src="/assets/images/iconchatbot/chatbot.png" 
              alt="ChatBot"
              style={{width: '24px', height: '24px', objectFit: 'contain'}}
            />
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
                <div className="hdbank-logo">
                  <img 
                    src="/assets/images/iconchatbot/chatbot.png" 
                    alt="HDBank Assistant"
                    style={{width: '32px', height: '32px', objectFit: 'contain'}}
                  />
                </div>
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
                  <div className="hdbank-personality-emoji">
                    {personality.iconPath ? (
                      <img 
                        src={personality.iconPath} 
                        alt={personality.name}
                        style={{width: '24px', height: '24px', objectFit: 'contain'}}
                      />
                    ) : (
                      personality.emoji
                    )}
                  </div>
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
                  {selectedPersonality?.iconPath ? (
                    <img 
                      src={selectedPersonality.iconPath} 
                      alt={selectedPersonality.name}
                      style={{width: '24px', height: '24px', objectFit: 'contain'}}
                    />
                  ) : (
                    selectedPersonality?.emoji || 'HD'
                  )}
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
