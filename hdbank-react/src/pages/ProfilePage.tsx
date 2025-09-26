import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import PersonalitySelector, { BankingPersonality, bankingPersonalities } from '../components/ui/PersonalitySelector';
import AuthAPI from '../services/authAPI';
import './ProfilePage.css';
import ZaloQuickSpendTrigger from '../components/ui/ZaloQuickSpendTrigger';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { selectedPersonality, setSelectedPersonality } = useChat();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshSource, setRefreshSource] = useState<'manual' | 'auto' | 'chatbot'>('manual');
  
  // Use the personality from ChatContext, with fallback to first personality
  const currentPersonality = selectedPersonality || bankingPersonalities[0];

  // Initialize selectedPersonality if it's null
  useEffect(() => {
    if (!selectedPersonality) {
      setSelectedPersonality(bankingPersonalities[0]);
    }
  }, [selectedPersonality, setSelectedPersonality]);

  // Auto-refresh data when component mounts or user changes
  useEffect(() => {
    if (user && !lastRefresh) {
      refreshUserData('auto');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for plan update events from chatbot
  useEffect(() => {
    const handlePlanUpdate = (event: CustomEvent) => {
      console.log('📄 ProfilePage received plan update event:', event.detail);
      // Auto-refresh profile data when chatbot updates plans
      refreshUserData('chatbot');
    };

    // Add event listener for plan updates
    window.addEventListener('hdbank:planUpdate', handlePlanUpdate as EventListener);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('hdbank:planUpdate', handlePlanUpdate as EventListener);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Refresh user data from server
  const refreshUserData = async (source: 'manual' | 'auto' | 'chatbot' = 'manual') => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      setRefreshSource(source);
      console.log(`🔄 Refreshing user data from server (${source})...`);
      
      const freshProfile = await AuthAPI.getProfile();
      updateUser(freshProfile);
      setLastRefresh(new Date());
      
      console.log('✅ User data refreshed successfully:', freshProfile);
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      // Could show a toast notification here
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = async () => {
    // Handle form save
    console.log('Saving profile information...');
    
    // After saving, refresh the data to get latest from DB
    await refreshUserData('manual');
  };

  const handlePersonalitySelect = (personality: BankingPersonality) => {
    // Update the ChatContext directly - this will sync everywhere
    setSelectedPersonality(personality);
    setShowPersonalitySelector(false);
    console.log('Personality updated:', personality.displayName);
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
            <div className="user-title-section">
              <h1>Xin chào, {fallbackUser?.username || 'Khách hàng'}!</h1>
              <button 
                className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
                onClick={() => refreshUserData('manual')}
                disabled={isRefreshing}
                title="Cập nhật dữ liệu mới nhất"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </svg>
                {isRefreshing ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
            <p className="user-segment">
              Khách hàng {fallbackUser?.segment || 'cá nhân'} 
              {fallbackUser?.age && ` • ${fallbackUser.age} tuổi`}
            </p>
            <p className="account-number">
              STK: {fallbackUser?.accountNumber || '0123456789'}
            </p>
            {lastRefresh && (
              <p className="last-refresh">
                Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}
                {refreshSource === 'chatbot' && (
                  <span className="refresh-source-badge">🤖 Từ chatbot</span>
                )}
                {refreshSource === 'auto' && (
                  <span className="refresh-source-badge">🔄 Tự động</span>
                )}
              </p>
            )}

            {/* Zalo Quick Spend Trigger - inline, themed to red */}
            <div style={{ marginTop: 12 }}>
              <ZaloQuickSpendTrigger serverBase="http://127.0.0.1:8011" theme="red" placement="inline" />
            </div>
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
            className={`tab ${activeTab === 'personality' ? 'active' : ''}`}
            onClick={() => setActiveTab('personality')}
          >
            Trợ lý AI
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

              {/* Personality Settings in Overview */}
              <div className="form-section">
                <h3>Trợ lý AI CashyBear</h3>
                <div className="personality-overview">
                  <div className="current-personality">
                    <div className="personality-display">
                      <div className="personality-icon-display">
                        <img 
                          src={currentPersonality.iconPath} 
                          alt={currentPersonality.displayName}
                          className="personality-current-icon"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const next = e.currentTarget.nextElementSibling;
                            if (next) next.classList.remove('hidden');
                          }}
                        />
                        <span className="personality-current-emoji hidden">{currentPersonality.icon || currentPersonality.emoji}</span>
                      </div>
                      <div className="personality-info">
                        <div className="personality-current-name">{currentPersonality.displayName}</div>
                        <div className="personality-current-desc">{currentPersonality.description}</div>
                      </div>
                    </div>
                    <button 
                      className="btn-change-personality"
                      onClick={() => setShowPersonalitySelector(true)}
                    >
                      Thay đổi
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>
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

          {activeTab === 'personality' && (
            <div className="personality-tab">
              {/* Personality Management */}
              <div className="form-section">
                <h3>Quản lý trợ lý AI CashyBear</h3>
                <div className="personality-management">
                  <div className="current-personality-details">
                    <div className="personality-header">
                      <div className="personality-main-icon">
                        <img 
                          src={currentPersonality.iconPath} 
                          alt={currentPersonality.displayName}
                          className="personality-large-icon"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const next = e.currentTarget.nextElementSibling;
                            if (next) next.classList.remove('hidden');
                          }}
                        />
                        <span className="personality-large-emoji hidden">{currentPersonality.icon || currentPersonality.emoji}</span>
                      </div>
                      <div className="personality-details">
                        <h4 className="personality-title">{currentPersonality.displayName}</h4>
                        <p className="personality-desc">{currentPersonality.description}</p>
                        <div className="personality-sample">
                          <strong>Tin nhắn mẫu:</strong>
                          <p className="sample-message">"{currentPersonality.initialMessage}"</p>
                        </div>
                      </div>
                    </div>
                    <div className="personality-actions">
                      <button 
                        className="btn-change-personality-large"
                        onClick={() => setShowPersonalitySelector(true)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Thay đổi tính cách
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Available Personalities */}
              <div className="form-section">
                <h3>Tất cả tính cách có sẵn</h3>
                <div className="personality-grid">
                  {bankingPersonalities.map((personality) => (
                    <div
                      key={personality.id}
                      className={`personality-card ${currentPersonality.id === personality.id ? 'current' : ''}`}
                      onClick={() => handlePersonalitySelect(personality)}
                    >
                      <div className="personality-card-icon">
                        <img 
                          src={personality.iconPath} 
                          alt={personality.displayName}
                          className="personality-card-img"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const next = e.currentTarget.nextElementSibling;
                            if (next) next.classList.remove('hidden');
                          }}
                        />
                        <span className="personality-card-emoji hidden">{personality.icon || personality.emoji}</span>
                      </div>
                      <div className="personality-card-content">
                        <h5 className="personality-card-name">{personality.displayName}</h5>
                        <p className="personality-card-desc">{personality.description}</p>
                        {currentPersonality.id === personality.id && (
                          <div className="current-badge">Đang sử dụng</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Settings */}
              <div className="form-section">
                <h3>Cài đặt trò chuyện</h3>
                <div className="chat-settings">
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">Tự động lưu lịch sử chat</div>
                      <div className="setting-description">Lưu các cuộc trò chuyện để cải thiện trải nghiệm</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">Gợi ý thông minh</div>
                      <div className="setting-description">Nhận gợi ý tài chính dựa trên hành vi của bạn</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">Thông báo proactive</div>
                      <div className="setting-description">CashyBear sẽ chủ động nhắc nhở bạn về mục tiêu tiết kiệm</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
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

      {/* Personality Selector Modal */}
      <PersonalitySelector
        isOpen={showPersonalitySelector}
        onSelect={handlePersonalitySelect}
        onClose={() => setShowPersonalitySelector(false)}
        title="Thay đổi tính cách CashyBear"
        showCloseButton={true}
      />
    </div>
  );
};

export default ProfilePage;
