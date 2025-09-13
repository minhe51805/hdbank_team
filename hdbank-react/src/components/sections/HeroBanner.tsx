import React from 'react';
import LoanCalculator from '../ui/LoanCalculator';
import LoanSidebarMenu from '../ui/LoanSidebarMenu';
import './HeroBanner.css';

const HeroBanner: React.FC = () => {
  return (
    <section className="home-banner">
      {/* Main Hero Container - This is the slide banner */}
      <div className="hero-slide-container">
        {/* Background Slide Image */}
        <div className="hero-slide-image">
          <img 
            src="/assets/images/37dc26945f63c6263a52a54ecd46e34d31b071bc.jpg" 
            alt="HDBank Hero Banner" 
            className="hero-background"
          />
        </div>

        {/* Overlay Content - Calculator and Menu INSIDE the slide */}
        <div className="hero-overlay-content">
          {/* Left Side - Menu */}
          <div className="hero-left-menu">
            {/* <LoanSidebarMenu /> */}
          </div>

          {/* Center - Hero Text */}
          <div className="hero-center-content">
            {/* Promo ribbon with marquee */}
            <div className="hero-ribbon">
              <div className="ribbon-marquee">
                <div className="ribbon-content">
                  <span>✦ HDBank BEMAX - Tài khoản tối đa lợi ích</span>
                  <span>✦ Đăng ký 100% Online, nhận thẻ tại nhà</span>
                  <span>⚡ Mở tài khoản online miễn phí - Nhận ngay 200.000 VNĐ</span>
                  <span>🎁 Thẻ tín dụng HDBank - Hoàn tiền lên đến 8%</span>
                  <span>💰 Vay online lãi suất từ 6.99%/năm</span>
                  <span>🏆 HDBank - Ngân hàng số hàng đầu Việt Nam</span>
                </div>
              </div>
            </div>

            <div className="hero-left-content-write">
              <div className="hero-title-wrap">
                <div className="hero-headlines">
                  <div className="headline-top">
                    <span className="txt-cho">CHO</span>
                    <span className="txt-vay">VAY</span>
                  </div>
                  <div className="headline-mid">MUA NHÀ</div>
                  <div className="headline-sub">
                    Thời hạn lên đến <span className="num-50">50</span> <span className="unit">năm</span>
                  </div>
                  <div className="hero-cta-section">
                    <div className="hero-subtitle">
                      Vay lớn dễ dàng 50 tỷ đồng<br />
                      Thủ tục nhanh chóng
                    </div>
                  </div>
                </div>
                
              </div>

              
            </div>

            <div className="hero-cta-row">
              {/* <button className="btn-primary-cta">Đăng ký ngay</button>  */}
              <div className="cta-chips">
                <div className="chip">
                  <span className="chip-title">Mở tài khoản</span>
                  <span className="chip-subtitle">thành toán</span>
                </div>
                <div className="chip">
                  <span className="chip-title">Vay</span>
                  <span className="chip-subtitle">trực tuyến</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Calculator positioned outside overlay */}
      <div className="hero-calculator-external">
        <LoanCalculator />
      </div>

      {/* Decorative Orange Line */}
      <div className="hero-decorative-line"></div>
    </section>
  );
};

export default HeroBanner;