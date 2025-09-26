import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      {/* <div className="footer__logo__arrow">
        <img alt="HDBank" src="/assets/images/icons/upTop.svg" />
      </div> */}
      
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-sm-12">
            <div className="footer-section">
              <div className="footer-logo">
                <img 
                  alt="HDBank" 
                  src="https://cdn.hdbank.com.vn/hdbank-file/picture/logo_1645778839158.png" 
                />
              </div>
              <div className="footer-info">
                <p><strong>NGÂN HÀNG TMCP PHÁT TRIỂN TP.HCM</strong></p>
                <p>Trụ sở chính: 25 Bis Nguyễn Thị Minh Khai, Phường Đa Kao, Quận 1, TP.HCM</p>
                <p>Điện thoại: (028) 3910 0000</p>
                <p>Fax: (028) 3910 0001</p>
                <p>Email: info@hdbank.com.vn</p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-2 col-sm-6">
            <div className="footer-section">
              <h4>Cá nhân</h4>
              <ul className="footer-links">
                <li><Link to="/vi/personal/product/ngan-hang-dien-tu">Ngân hàng điện tử</Link></li>
                <li><Link to="/vi/personal/product/san-pham-vay">Sản phẩm vay</Link></li>
                <li><Link to="/vi/personal/product/the">Thẻ</Link></li>
                <li><Link to="/vi/personal/product/san-pham-tien-gui">Sản phẩm tiền gửi</Link></li>
                <li><Link to="/vi/personal/product/bao-hiem">Bảo hiểm</Link></li>
                <li><Link to="/vi/personal/promotion">Ưu đãi</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="col-lg-2 col-sm-6">
            <div className="footer-section">
              <h4>Doanh nghiệp</h4>
              <ul className="footer-links">
                <li><Link to="/vi/corporate/product/ngoai-te-phai-sinh">Ngoại tệ & Phái sinh</Link></li>
                <li><Link to="/vi/corporate/product/tai-tro-thuong-mai">Tài trợ thương mại</Link></li>
                <li><Link to="/vi/corporate/product/tin-dung">Tín dụng</Link></li>
                <li><Link to="/vi/corporate/product/quan-ly-dong-tien">Quản lý dòng tiền</Link></li>
                <li><Link to="/vi/corporate/promotion">Ưu đãi</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="col-lg-2 col-sm-6">
            <div className="footer-section">
              <h4>Hỗ trợ</h4>
              <ul className="footer-links">
                <li><Link to="/vi/support/faq">Câu hỏi thường gặp</Link></li>
                <li><Link to="/vi/support/contact">Liên hệ</Link></li>
                <li><Link to="/vi/support/branch-atm">Chi nhánh & ATM</Link></li>
                <li><Link to="/vi/support/fees">Biểu phí dịch vụ</Link></li>
                <li><Link to="/vi/support/security">Bảo mật</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="col-lg-3 col-sm-6">
            <div className="footer-section">
              <h4>Kết nối với chúng tôi</h4>
              <div className="social-links">
                <a href="https://facebook.com/hdbank" target="_blank" rel="noopener noreferrer">
                  <img src="/assets/images/icons/facebook.png" alt="Facebook" />
                </a>
                <a href="https://youtube.com/hdbank" target="_blank" rel="noopener noreferrer">
                  <img src="/assets/images/icons/youtube.png" alt="YouTube" />
                </a>
                <a href="https://linkedin.com/company/hdbank" target="_blank" rel="noopener noreferrer">
                  <img src="/assets/images/icons/linkedin.png" alt="LinkedIn" />
                </a>
              </div>
              
              <div className="download-app">
                <h5>Tải ứng dụng</h5>
                <div className="app-buttons">
                  <a href="https://apps.apple.com/vn/app/hdbank" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/images/app-store-small.png" alt="App Store" />
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.hdbank" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/images/google-play-small.png" alt="Google Play" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="row">
            <div className="col-md-6">
              <div className="footer-legal">
                <p>&copy; 2024 HDBank. Tất cả quyền được bảo lưu.</p>
                <div className="legal-links">
                  <Link to="/terms">Điều khoản sử dụng</Link>
                  <Link to="/privacy">Chính sách bảo mật</Link>
                  <Link to="/cookies">Chính sách Cookie</Link>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="footer-certifications">
                <div className="cert-item">
                  <img src="/assets/images/certifications/cert1.png" alt="Certification 1" />
                </div>
                <div className="cert-item">
                  <img src="/assets/images/certifications/cert2.png" alt="Certification 2" />
                </div>
                <div className="cert-item">
                  <img src="/assets/images/certifications/cert3.png" alt="Certification 3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
