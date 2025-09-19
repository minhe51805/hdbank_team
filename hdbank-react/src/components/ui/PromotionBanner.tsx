import React from 'react';
import './PromotionBanner.css';

interface PromotionBannerProps {
  leftText?: string;
  rightText?: string;
  className?: string;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({
  leftText = "HDBank BEMAX - Tài khoản tối đa lợi ích",
  rightText = "Đăng ký 100% Online, nhận thẻ tại nhà",
  className = ""
}) => {
  return (
    <div className={`promotion-banner ${className}`}>
      <div className="promotion-content">
        <div className="promotion-left">
          <span className="star-icon">✦</span>
          <span className="promotion-text">{leftText}</span>
        </div>
        <div className="promotion-right">
          <span className="star-icon">✦</span>
          <span className="promotion-text">{rightText}</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionBanner;

