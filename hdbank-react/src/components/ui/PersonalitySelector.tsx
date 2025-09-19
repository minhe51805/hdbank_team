import React, { useState } from 'react';
import './PersonalitySelector.css';

export interface BankingPersonality {
  id: string;
  name: string;
  displayName: string;
  description: string;
  prompt: string;
  initialMessage: string;
  emoji: string;
  iconPath: string;
  color: string;
  icon?: string;
}

export const bankingPersonalities: BankingPersonality[] = [
  {
    id: "mentor",
    name: "Mentor", 
    displayName: "Người Cố Vấn Thông Thái",
    description: "Lịch sự, chuyên nghiệp, giải thích từng bước rõ ràng, định hướng hành động tối ưu",
    prompt: "Bạn là CashyBear – Gấu nhắc tiết kiệm, ví bạn thêm xịn. Phong cách Mentor: lịch sự, chuyên nghiệp, giải thích từng bước rõ ràng, định hướng hành động.",
    initialMessage: "Chào bạn! Mình là CashyBear (Mentor). Bạn muốn đặt mục tiêu tiết kiệm nào để mình cùng lên kế hoạch 7/14 ngày trước nhé?",
    emoji: "🧠",
    iconPath: "/assets/gif/chatbotmentor.gif",
    color: "#2563eb",
    icon: "💼"
  },
  {
    id: "angry_mom",
    name: "Angry Mom",
    displayName: "Mẹ Giật Gân", 
    description: "Nghiêm khắc, càu nhàu nhưng quan tâm, bảo vệ ví của bạn như bảo vệ con",
    prompt: "Bạn là CashyBear – phong cách Angry Mom: thẳng, càu nhàu nhưng quan tâm; mục tiêu là bảo vệ ví người dùng.",
    initialMessage: "Vào việc nhé! Cho mình biết mục tiêu và thời gian, mình chốt cho bạn kế hoạch 7/14 ngày trước, làm được thì đi tiếp.",
    emoji: "🧹",
    iconPath: "/assets/gif/chatbotmom.gif",
    color: "#dc2626",
    icon: "👩‍⚖️"
  },
  {
    id: "banter",
    name: "Banter",
    displayName: "Cô Đồng Viên Vui Vẻ",
    description: "Gen Z thân thiện, vui vẻ, hài hước, trêu nhẹ để khích lệ thay đổi thói quen tiền bạc",
    prompt: "Bạn là CashyBear – phong cách Banter: thân thiện, hài hước, trêu nhẹ để khích lệ thay đổi thói quen tiền bạc.",
    initialMessage: "Hello bạn! CashyBear đây 😎 Cho mình biết mục tiêu tiền bạc của bạn nè, lên plan 7/14 ngày trước cho gọn.",
    emoji: "😄",
    iconPath: "/assets/gif/chatbotbanter.gif",
    color: "#e91e63",
    icon: "🌟"
  }
];

interface PersonalitySelectorProps {
  isOpen: boolean;
  onSelect: (personality: BankingPersonality) => void;
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ 
  isOpen, 
  onSelect, 
  onClose,
  title = "Thiết lập trợ lý tài chính của bạn - CashyBear",
  showCloseButton = false
}) => {
  const [selectedPersonality, setSelectedPersonality] = useState<BankingPersonality | null>(null);
  const [hasAgreed, setHasAgreed] = useState(false);

  if (!isOpen) return null;

  const handlePersonalityClick = (personality: BankingPersonality) => {
    setSelectedPersonality(personality);
  };

  const handleContinue = () => {
    if (selectedPersonality && hasAgreed) {
      onSelect(selectedPersonality);
    }
  };

  return (
    <div className="personality-selector-overlay">
      <div className="personality-selector-container">
        {showCloseButton && onClose && (
          <button className="personality-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        
        <div className="personality-header">
          <h1 className="personality-title">{title}</h1>
          <p className="personality-subtitle">Bạn muốn CashyBear có tính cách như thế nào?</p>
        </div>

        <div className="personality-options">
          {bankingPersonalities.map((personality) => (
            <div
              key={personality.id}
              className={`personality-option ${selectedPersonality?.id === personality.id ? 'selected' : ''}`}
              onClick={() => handlePersonalityClick(personality)}
              style={{ '--personality-color': personality.color } as React.CSSProperties}
            >
              <div className="personality-icon">
                <img 
                  src={personality.iconPath} 
                  alt={personality.name}
                  className="personality-icon-img"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="personality-emoji hidden">{personality.icon || personality.emoji}</span>
              </div>
              <div className="personality-content">
                <h3 className="personality-name">{personality.displayName}</h3>
                <p className="personality-description">{personality.description}</p>
              </div>
              <div className={`personality-radio ${selectedPersonality?.id === personality.id ? 'checked' : ''}`}>
                <div className="radio-dot"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="personality-agreement">
          <label className="agreement-checkbox">
            <input 
              type="checkbox" 
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
            />
            <span className="checkmark"></span>
            <span className="agreement-text">
              Chọn mô hình có điểm tương tác cao nhất với nghiên cứu khác từ 
              HDBank và giao diện để đây được gọi là dữ liệu của mình.
            </span>
          </label>
        </div>

        <button 
          className={`personality-continue-btn ${selectedPersonality && hasAgreed ? 'active' : 'disabled'}`}
          onClick={handleContinue}
          disabled={!selectedPersonality || !hasAgreed}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default PersonalitySelector;
