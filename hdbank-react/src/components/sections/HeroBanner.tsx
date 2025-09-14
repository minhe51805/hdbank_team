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
            src="/assets/images/bg-1.jpg" 
            alt="HDBank Hero Banner" 
            className="hero-background"
          />
        </div>

        {/* Overlay Content - Calculator and Menu INSIDE the slide */}
        <div className="hero-overlay-content">
          {/* Left Side - Menu */}
          <div className="hero-left-menu">
            <LoanSidebarMenu />
          </div>

          {/* Center - Hero Text */}
          <div className="hero-center-content">
            <h1 className="hero-main-title">
              <span className="hero-title-line1">CHO VAY MUA NHÀ</span>
              <span className="hero-title-line2">
                Thời hạn đến <strong className="highlight-50">50</strong> năm
              </span>
            </h1>
            
            <div className="hero-features-badges">
              <div className="feature-badge yellow">
                <span>Vay tới 50</span>
                <strong>TỶ ĐỒNG</strong>
              </div>
              <div className="feature-badge green">
                <span>Thủ tục</span>
                <strong>nhanh chóng</strong>
              </div>
              <div className="feature-badge blue">
                <span>Ân hạn gốc đến</span>
                <strong>5 NĂM</strong>
              </div>
            </div>
            
            <p className="hero-slogan">Vay dễ dàng, Trả nhẹ nhàng</p>
          </div>

          {/* Right Side - Calculator INSIDE the slide banner */}
          <div className="hero-right-calculator">
            <LoanCalculator />
          </div>
        </div>
      </div>


    </section>
  );
};

export default HeroBanner;