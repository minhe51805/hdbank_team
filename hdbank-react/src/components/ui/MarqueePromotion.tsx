import React from 'react';
import './MarqueePromotion.css';

interface MarqueePromotionProps {
  className?: string;
}

const MarqueePromotion: React.FC<MarqueePromotionProps> = ({ className = "" }) => {
  return (
    <div className={`marquee-promotion ${className}`}>
      <div className="marquee-wrapper">
        <div className="marquee_text marquee-container">
          <div className="marquee">
            <div className="marquee-list_item">
              <span>✦</span>
              <span>HDBank BEMAX - Tài khoản tối đa lợi ích</span>
            </div>
            <div className="marquee-list_item">
              <span>✦</span>
              <span>Đăng ký 100% Online, nhận thẻ tại nhà</span>
            </div>
            <div className="marquee-list_item">
              <span>⚡</span>
              <span>Mở tài khoản online miễn phí - Nhận ngay 200.000 VNĐ</span>
            </div>
            <div className="marquee-list_item">
              <span>🎁</span>
              <span>Thẻ tín dụng HDBank - Hoàn tiền lên đến 8%</span>
            </div>
            <div className="marquee-list_item">
              <span>💰</span>
              <span>Vay online lãi suất từ 6.99%/năm</span>
            </div>
            <div className="marquee-list_item">
              <span>🏆</span>
              <span>HDBank - Ngân hàng số hàng đầu Việt Nam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarqueePromotion;
