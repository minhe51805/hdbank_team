import React from 'react';
import HeroBanner from '../components/sections/HeroBanner';
import Services from '../components/sections/Services';
import ProductSlider from '../components/sections/ProductSlider';
import ChatBot from '../components/ui/ChatBot';
import './HomePage.css';
import { fetchOffer } from '../utils/promoAPI';
import NotificationToast from '../components/ui/NotificationToast';

const HomePage: React.FC = () => {
  const [toast, setToast] = React.useState<{ title: string; lines: string[]; timeoutMs?: number } | null>(null);

  React.useEffect(() => {
    const cid = Number(localStorage.getItem('customerId') || '0');
    if (!cid) return;
    const key = `promoShown:2025-08:${cid}`;
    const force = localStorage.getItem('forcePromo') === '1';
    if (localStorage.getItem(key) && !force) return;

    fetchOffer(cid, 0.6).then(res => {
      if (res.shouldNotify && res.message) {
        setToast({ title: res.message.title, lines: res.message.lines, timeoutMs: res.message.timeoutMs });
        localStorage.setItem(key, '1');
        localStorage.removeItem('forcePromo');
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      
      {/* Hero Banner Section with integrated Three-Column Layout */}
      <HeroBanner />

      {/* Services Section */}
      <section className="services-section section">
        <div className="container">
          <h2 className="section-title text-gradient">Dịch vụ nổi bật</h2>
          <p className="section-subtitle">
            Trải nghiệm các dịch vụ ngân hàng hiện đại và tiện lợi nhất từ HDBank
          </p>
          <Services />
        </div>
      </section>

      {/* Personal Banking Products */}
      <section className="products-section section">
        <div className="container">
          <h2 className="section-title text-gradient">Khách hàng cá nhân</h2>
          <p className="section-subtitle">
            Các sản phẩm và dịch vụ tài chính phù hợp cho mọi nhu cầu cá nhân
          </p>
          <ProductSlider category="personal" />
        </div>
      </section>

      {/* Corporate Banking Products */}
      <section className="products-section section bg-gradient-light">
        <div className="container">
          <h2 className="section-title text-gradient">Khách hàng doanh nghiệp</h2>
          <p className="section-subtitle">
            Giải pháp tài chính toàn diện cho doanh nghiệp phát triển bền vững
          </p>
          <ProductSlider category="corporate" />
        </div>
      </section>

      {/* Financial Insights Dashboard */}
      <section className="insights-section">
        <div className="container">
          <h2 className="section-title text-gradient">Thông tin tài chính hôm nay</h2>
          <p className="section-subtitle">
            Cập nhật thông tin thị trường và cơ hội đầu tư mới nhất
          </p>
          
          <div className="insights-grid">
            <div className="insight-card market-overview">
              <div className="card-header">
                <h3>📊 Thị trường chứng khoán</h3>
                <span className="trend-up">+2.3%</span>
              </div>
              <div className="market-stats">
                <div className="stat-item">
                  <span className="label">VN-Index</span>
                  <span className="value">1,234.56</span>
                  <span className="change positive">+12.34</span>
                </div>
                <div className="stat-item">
                  <span className="label">HNX-Index</span>
                  <span className="value">234.78</span>
                  <span className="change positive">+5.67</span>
                </div>
                <div className="stat-item">
                  <span className="label">UPCoM</span>
                  <span className="value">89.12</span>
                  <span className="change negative">-1.23</span>
                </div>
              </div>
            </div>

            <div className="insight-card exchange-rates">
              <div className="card-header">
                <h3>💱 Tỷ giá ngoại tệ</h3>
                <span className="update-time">Cập nhật: 14:30</span>
              </div>
              <div className="exchange-list">
                <div className="exchange-item">
                  <div className="currency">
                    <span className="flag">🇺🇸</span>
                    <span className="code">USD</span>
                  </div>
                  <div className="rates">
                    <span className="buy">24,100</span>
                    <span className="sell">24,300</span>
                  </div>
                </div>
                <div className="exchange-item">
                  <div className="currency">
                    <span className="flag">🇪🇺</span>
                    <span className="code">EUR</span>
                  </div>
                  <div className="rates">
                    <span className="buy">25,800</span>
                    <span className="sell">26,100</span>
                  </div>
                </div>
                <div className="exchange-item">
                  <div className="currency">
                    <span className="flag">🇯🇵</span>
                    <span className="code">JPY</span>
                  </div>
                  <div className="rates">
                    <span className="buy">162</span>
                    <span className="sell">168</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="insight-card gold-price">
              <div className="card-header">
                <h3>🥇 Giá vàng SJC</h3>
                <span className="trend-down">-0.5%</span>
              </div>
              <div className="gold-stats">
                <div className="price-row">
                  <span className="type">Vàng nhẫn</span>
                  <div className="price-info">
                    <span className="buy">75.8 triệu</span>
                    <span className="sell">77.2 triệu</span>
                  </div>
                </div>
                <div className="price-row">
                  <span className="type">Vàng miếng</span>
                  <div className="price-info">
                    <span className="buy">76.5 triệu</span>
                    <span className="sell">78.0 triệu</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="insight-card interest-rates">
              <div className="card-header">
                <h3>💰 Lãi suất tiết kiệm</h3>
                <span className="highlight">Ưu đãi đặc biệt</span>
              </div>
              <div className="rates-list">
                <div className="rate-item featured">
                  <span className="term">12 tháng</span>
                  <span className="rate">6.8%/năm</span>
                  <span className="bonus">+0.3% thưởng</span>
                </div>
                <div className="rate-item">
                  <span className="term">6 tháng</span>
                  <span className="rate">6.2%/năm</span>
                </div>
                <div className="rate-item">
                  <span className="term">3 tháng</span>
                  <span className="rate">5.8%/năm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Promotions Carousel */}
      <section className="promotions-carousel-section">
        <div className="container">
          <h2 className="section-title text-gradient">🔥 Ưu đãi hot nhất tháng</h2>
          <div className="promotions-carousel">
            <div className="promo-card-new mega-deal">
              <div className="promo-badge">SIÊU ƯU ĐÃI</div>
              <div className="promo-content">
                <h3>Hoàn tiền 15% thẻ tín dụng</h3>
                <p>Dành riêng cho khách hàng mới</p>
                <div className="promo-timer">
                  <span>⏰ Còn 15 ngày</span>
                </div>
              </div>
              <div className="promo-action">
                <button className="btn-claim">Nhận ngay</button>
              </div>
            </div>

            <div className="promo-card-new savings-boost">
              <div className="promo-badge">TIẾT KIỆM</div>
              <div className="promo-content">
                <h3>Lãi suất 7.5%/năm</h3>
                <p>Gửi online từ 100 triệu</p>
                <div className="promo-timer">
                  <span>⏰ Còn 7 ngày</span>
                </div>
              </div>
              <div className="promo-action">
                <button className="btn-claim">Gửi ngay</button>
              </div>
            </div>

            <div className="promo-card-new loan-offer">
              <div className="promo-badge">VAY VỐN</div>
              <div className="promo-content">
                <h3>Vay online 0% lãi suất</h3>
                <p>30 ngày đầu miễn phí</p>
                <div className="promo-timer">
                  <span>⏰ Còn 3 ngày</span>
                </div>
              </div>
              <div className="promo-action">
                <button className="btn-claim">Vay ngay</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="download-app-section section bg-gradient-primary">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="app-info animate-fade-in-left">
                <h2 className="text-shadow">Tải ứng dụng HDBank</h2>
                <p>Trải nghiệm ngân hàng số hiện đại với HDBank Mobile Banking</p>
                <ul className="app-features">
                  <li>✓ Mở tài khoản online trong 3 phút</li>
                  <li>✓ Chuyển tiền miễn phí 24/7</li>
                  <li>✓ Thanh toán hóa đơn tiện lợi</li>
                  <li>✓ Vay online lãi suất ưu đãi</li>
                </ul>
                <div className="download-buttons">
                  <a href="https://apps.apple.com/vn/app/hdbank/id1234567890" className="app-store-btn">
                    <img src="/assets/images/app-store.png" alt="Download on App Store" />
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.hdbank.mobile" className="google-play-btn">
                    <img src="/assets/images/google-play.png" alt="Get it on Google Play" />
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="app-mockup">
                <img src="/assets/images/hdbank-app-mockup.png" alt="HDBank Mobile App" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="icon-phone"></i>
                </div>
                <h4>Hotline</h4>
                <p>1900 6060</p>
                <span>24/7 - Miễn phí</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="icon-location"></i>
                </div>
                <h4>Tìm chi nhánh</h4>
                <p>Hơn 300 điểm giao dịch</p>
                <span>Trên toàn quốc</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="icon-chat"></i>
                </div>
                <h4>Chat online</h4>
                <p>Hỗ trợ trực tuyến</p>
                <span>8:00 - 22:00 hàng ngày</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Toast */}
      {toast && (
        <NotificationToast title={toast.title} lines={toast.lines} timeoutMs={toast.timeoutMs} position="topRight" offsetTop={96} onClose={() => setToast(null)} />
      )}

      {/* HDBank ChatBot */}
      <ChatBot />
    </div>
  );
};

export default HomePage;
