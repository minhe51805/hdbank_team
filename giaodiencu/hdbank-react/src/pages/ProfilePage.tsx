import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Get fallback user data from localStorage if needed
  const fallbackUser = React.useMemo(() => {
    if (user) return user;
    
    const storedUser = localStorage.getItem('hdbank_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    
    const customerId = localStorage.getItem('customerId');
    const username = localStorage.getItem('username');
    if (customerId && username) {
      return { 
        username, 
        customerId: parseInt(customerId), 
        segment: 'family', 
        age: 35,
        balance: 15750000,
        accountNumber: '0123456789'
      };
    }
    
    return null;
  }, [user]);

  const handleSave = () => {
    // Handle form save
    console.log('Saving profile information...');
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* User Info Header */}
        <div className="profile-header">
          <div className="user-avatar-large">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="user-info-header">
            <h1>Xin chào, {fallbackUser?.username || 'Khách hàng'}!</h1>
            <p className="user-segment">
              Khách hàng {fallbackUser?.segment || 'cá nhân'} 
              {fallbackUser?.age && ` • ${fallbackUser.age} tuổi`}
            </p>
            <p className="account-number">
              STK: {fallbackUser?.accountNumber || '0123456789'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Thông tin cá nhân
          </button>
          <button 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Cài đặt tài khoản
          </button>
          <button 
            className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            Bảo mật
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Personal Information Form */}
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input 
                      type="text" 
                      defaultValue={fallbackUser?.username || ''} 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      defaultValue="khachhang1@hdbank.com.vn" 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input 
                      type="tel" 
                      defaultValue="0901234567" 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input 
                      type="date" 
                      defaultValue="1989-01-15" 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select className="form-input">
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nghề nghiệp</label>
                    <input 
                      type="text" 
                      defaultValue="Kỹ sư phần mềm" 
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="form-section">
                <h3>Địa chỉ liên hệ</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Địa chỉ</label>
                    <input 
                      type="text" 
                      defaultValue="123 Đường ABC, Phường XYZ" 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quận/Huyện</label>
                    <select className="form-input">
                      <option value="district1">Quận 1</option>
                      <option value="district3">Quận 3</option>
                      <option value="district7">Quận 7</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Thành phố</label>
                    <select className="form-input">
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="danang">Đà Nẵng</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="form-section">
                <h3>Ảnh đại diện</h3>
                <div className="photo-upload">
                  <div className="current-photo">
                    <div className="photo-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                  <div className="photo-actions">
                    <button className="btn-upload">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Tải ảnh lên
                    </button>
                    <button className="btn-remove">Xóa ảnh</button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="form-actions">
                <button className="btn-save">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="settings-tab">
              {/* Account Settings */}
              <div className="form-section">
                <h3>Cài đặt tài khoản</h3>
                <div className="settings-grid">
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">Tên đăng nhập</div>
                      <div className="setting-description">Tên đăng nhập hiện tại của bạn</div>
                    </div>
                    <div className="setting-value">
                      <span>{fallbackUser?.username || 'khachhang1'}</span>
                      <button className="btn-change">Thay đổi</button>
                    </div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">Email liên kết</div>
                      <div className="setting-description">Email để nhận thông báo và khôi phục tài khoản</div>
                    </div>
                    <div className="setting-value">
                      <span>khachhang1@hdbank.com.vn</span>
                      <button className="btn-change">Thay đổi</button>
                    </div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">Số điện thoại</div>
                      <div className="setting-description">Số điện thoại để xác thực giao dịch</div>
                    </div>
                    <div className="setting-value">
                      <span>0901***567</span>
                      <button className="btn-change">Thay đổi</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="form-section">
                <h3>Cài đặt thông báo</h3>
                <div className="notification-settings">
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-title">Thông báo giao dịch</div>
                      <div className="notification-description">Nhận thông báo khi có giao dịch vào/ra tài khoản</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-title">Thông báo khuyến mãi</div>
                      <div className="notification-description">Nhận thông báo về các chương trình ưu đãi</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-title">Báo cáo tài chính</div>
                      <div className="notification-description">Nhận báo cáo tài chính hàng tháng</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="form-section">
                <h3>Cài đặt quyền riêng tư</h3>
                <div className="privacy-settings">
                  <div className="privacy-item">
                    <div className="privacy-info">
                      <div className="privacy-title">Hiển thị số dư</div>
                      <div className="privacy-description">Hiển thị số dư tài khoản trên trang chính</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  <div className="privacy-item">
                    <div className="privacy-info">
                      <div className="privacy-title">Lịch sử giao dịch</div>
                      <div className="privacy-description">Cho phép lưu lịch sử giao dịch để phân tích</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="security-tab">
              {/* Password Settings */}
              <div className="form-section">
                <h3>Bảo mật mật khẩu</h3>
                <div className="password-section">
                  <div className="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input type="password" className="form-input" placeholder="Nhập mật khẩu hiện tại" />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <input type="password" className="form-input" placeholder="Nhập mật khẩu mới" />
                  </div>
                  <div className="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input type="password" className="form-input" placeholder="Nhập lại mật khẩu mới" />
                  </div>
                  <button className="btn-change-password">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Đổi mật khẩu
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="form-section">
                <h3>Xác thực hai yếu tố (2FA)</h3>
                <div className="security-settings">
                  <div className="security-item">
                    <div className="security-info">
                      <div className="security-title">SMS OTP</div>
                      <div className="security-description">Xác thực qua tin nhắn SMS</div>
                      <div className="security-status enabled">Đã kích hoạt</div>
                    </div>
                    <div className="security-actions">
                      <button className="btn-disable">Tắt</button>
                    </div>
                  </div>
                  
                  <div className="security-item">
                    <div className="security-info">
                      <div className="security-title">Email OTP</div>
                      <div className="security-description">Xác thực qua email</div>
                      <div className="security-status disabled">Chưa kích hoạt</div>
                    </div>
                    <div className="security-actions">
                      <button className="btn-enable">Kích hoạt</button>
                    </div>
                  </div>
                  
                  <div className="security-item">
                    <div className="security-info">
                      <div className="security-title">Authenticator App</div>
                      <div className="security-description">Xác thực qua ứng dụng Google Authenticator</div>
                      <div className="security-status disabled">Chưa kích hoạt</div>
                    </div>
                    <div className="security-actions">
                      <button className="btn-enable">Kích hoạt</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login History */}
              <div className="form-section">
                <h3>Lịch sử đăng nhập</h3>
                <div className="login-history">
                  <div className="login-item">
                    <div className="login-info">
                      <div className="login-device">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        Chrome trên Windows
                      </div>
                      <div className="login-location">TP. Hồ Chí Minh, Việt Nam</div>
                    </div>
                    <div className="login-time">
                      <div className="login-date">Hôm nay, 14:30</div>
                      <div className="login-status current">Phiên hiện tại</div>
                    </div>
                  </div>
                  
                  <div className="login-item">
                    <div className="login-info">
                      <div className="login-device">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        Safari trên iPhone
                      </div>
                      <div className="login-location">TP. Hồ Chí Minh, Việt Nam</div>
                    </div>
                    <div className="login-time">
                      <div className="login-date">Hôm qua, 09:15</div>
                      <div className="login-status">Đã đăng xuất</div>
                    </div>
                  </div>
                  
                  <div className="login-item">
                    <div className="login-info">
                      <div className="login-device">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        Firefox trên Windows
                      </div>
                      <div className="login-location">Hà Nội, Việt Nam</div>
                    </div>
                    <div className="login-time">
                      <div className="login-date">3 ngày trước, 16:45</div>
                      <div className="login-status">Đã đăng xuất</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="form-section">
                <h3>Hành động tài khoản</h3>
                <div className="account-actions">
                  <button className="btn-danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Đóng tài khoản
                  </button>
                  <button className="btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16,17 21,12 16,7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Đăng xuất tất cả thiết bị
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
