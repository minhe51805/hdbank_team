import React from 'react';
import MarqueePromotion from '../components/ui/MarqueePromotion';
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
      {/* Marquee Promotion - Vị trí trên cùng */}
      <MarqueePromotion />
      
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

      {/* News & Promotions */}
      <section className="news-section">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h3>Tin tức mới nhất</h3>
              <div className="news-list">
                <div className="news-item">
                  <div className="news-image">
                    <img src="https://cdn.hdbank.com.vn/hdbank-file/news/thumbnail_1755934834317.jpg" alt="News" />
                  </div>
                  <div className="news-content">
                    <h4>HDBank được vinh danh "Thương hiệu Quốc gia Việt Nam 2024"</h4>
                    <p>HDBank tiếp tục khẳng định vị thế hàng đầu trong ngành ngân hàng Việt Nam...</p>
                    <span className="news-date">25/08/2024</span>
                  </div>
                </div>
                
                <div className="news-item">
                  <div className="news-image">
                    <img src="https://cdn.hdbank.com.vn/hdbank-file/news/thumbnail_1755573621159.jpg" alt="News" />
                  </div>
                  <div className="news-content">
                    <h4>Ra mắt tính năng mở tài khoản online mới</h4>
                    <p>Khách hàng có thể mở tài khoản HDBank chỉ trong 3 phút với công nghệ eKYC...</p>
                    <span className="news-date">20/08/2024</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <h3>Ưu đãi hot</h3>
              <div className="promotion-list">
                <div className="promotion-item">
                  <div className="promotion-image">
                    <img src="https://cdn.hdbank.com.vn/hdbank-file/promotion/thumbnail_1742802764080.jpg" alt="Promotion" />
                  </div>
                  <div className="promotion-content">
                    <h4>Hoàn tiền lên đến 8% khi sử dụng thẻ tín dụng HDBank</h4>
                    <p>Áp dụng cho tất cả giao dịch mua sắm, ăn uống, giải trí...</p>
                    <span className="promotion-validity">Có hiệu lực đến 31/12/2024</span>
                  </div>
                </div>
                
                <div className="promotion-item">
                  <div className="promotion-image">
                    <img src="https://cdn.hdbank.com.vn/hdbank-file/promotion/thumbnail_1712029980463.jpg" alt="Promotion" />
                  </div>
                  <div className="promotion-content">
                    <h4>Lãi suất tiết kiệm ưu đãi lên đến 6.8%/năm</h4>
                    <p>Dành cho khách hàng mới mở tài khoản tiết kiệm online...</p>
                    <span className="promotion-validity">Có hiệu lực đến 30/09/2024</span>
                  </div>
                </div>
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
