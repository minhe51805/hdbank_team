import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './HeaderOriginal.css';

const HeaderOriginal: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  
  // Get fallback data from localStorage if user object not ready
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
      return { username, customerId: parseInt(customerId), segment: 'family', age: 35 };
    }
    
    return null;
  }, [user]);

  // Debug authentication state
  console.log('🔍 Header Auth State:', { 
    isAuthenticated, 
    user: user ? { username: user.username, segment: user.segment, age: user.age } : null,
    fallbackUser: fallbackUser ? { username: fallbackUser.username, segment: fallbackUser.segment } : null,
    hasToken: !!localStorage.getItem('hdbank_token')
  });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  // Close search when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (searchOpen && !target.closest('.search-box')) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      // Call logout from AuthContext
      await logout();
      
      // Force clear all HDBank-related localStorage keys
      const keysToRemove = [
        'hdbank_token',
        'hdbank_user', 
        'customerId',
        'username',
        'hdbank_chat_messages',
        'hdbank_chat_sessionId',
        'hdbank_chat_selectedPersonality'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Close user menu
      setIsUserMenuOpen(false);
      
      // Force redirect to home page
      window.location.href = '/';
      
      console.log('✅ Logout completed successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout fails, still clear localStorage and redirect
      const keysToRemove = [
        'hdbank_token',
        'hdbank_user',
        'customerId', 
        'username',
        'hdbank_chat_messages',
        'hdbank_chat_sessionId',
        'hdbank_chat_selectedPersonality'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      setIsUserMenuOpen(false);
      window.location.href = '/';
    }
  };

  return (
    <div className="nav-top">
      <nav>
        <div className="container">
          <div className={`nav-full d-flex align-center ${searchOpen ? 'search-active' : ''}`}>
            {/* Left side - Navigation */}
            <div className="nav-left">
              {/* Mobile menu toggle */}
              <div className="btn btn-toggle" id="toggle" onClick={toggleMobileMenu}>
                <span className="btn-burger-icon"></span>
                <span className="btn-burger-icon"></span>
                <span className="btn-burger-icon"></span>
                <span className="btn-burger-icon"></span>
                <span className="btn-burger-icon"></span>
              </div>

              {/* Logo */}
              <div className="logo">
                <Link to="/vi">
                  <img 
                    alt="HDBank" 
                    src="https://cdn.hdbank.com.vn/hdbank-file/picture/logo_1645778839158.png" 
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/vi/personal">Cá nhân</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/vi/corporate">Doanh nghiệp</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/vi/personal/priority">Khách hàng đặc biệt</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/vi/investor">Nhà đầu tư</Link>
                </li>
              </ul>
            </div>

            {/* Right side - Search + User Menu */}
            <div className="header-right">
              {/* Search Box */}
              <div className={`search-box ${searchOpen ? 'active' : ''}`} id="header-nav-top">
                {!searchOpen && (
                  <button className="search-trigger" onClick={toggleSearch}>
                    <img alt="" src="/assets/images/icons/search.png" />
                  </button>
                )}
                {searchOpen && (
                <form className="searchform" id="searchform" action="" method="post">
                  <div className="form-group">
                    <input 
                      type="text" 
                      className="searchinput" 
                      id="inputSearch" 
                      name="inputSearch" 
                      placeholder="Nhập từ khóa tìm kiếm..." 
                      autoFocus
                    />
                    <div className="close" onClick={closeSearch}>
                      <img src="/assets/images/icons/close.png" alt="close" />
                    </div>
                    <button type="submit">
                      <img alt="" src="/assets/images/icons/search.png" />
                    </button>
                  </div>
                </form>
                )}
              </div>
              {/* Authenticated User Menu or Login/Register Buttons */}
              {(isAuthenticated && user) || localStorage.getItem('hdbank_token') || localStorage.getItem('customerId') ? (
                <div className="user-menu">
                  <button className="user-btn" onClick={toggleUserMenu}>
                    <div className="user-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <span className="user-greeting">
                      {fallbackUser?.username || 'Khách hàng'}
                    </span>
                    <svg className={`user-arrow ${isUserMenuOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className="user-name">{fallbackUser?.username || 'Khách hàng'}</div>
                        <div className="user-segment">
                          {fallbackUser?.segment ? 
                            `${fallbackUser.segment} ${fallbackUser.age ? `• ${fallbackUser.age} tuổi` : ''}` : 
                            'Khách hàng HDBank'
                          }
                        </div>
                        {fallbackUser?.balance && (
                          <div className="user-balance">
                            Số dư: {new Intl.NumberFormat('vi-VN').format(fallbackUser.balance)} VNĐ
                          </div>
                        )}
                      </div>
                      <div className="user-actions">
                        <Link to="/profile" className="user-action">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          Thông tin cá nhân
                        </Link>
                        <Link to="/dashboard" className="user-action">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="9"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                          </svg>
                          Tài khoản của tôi
                        </Link>
                        <button className="user-action logout-btn" onClick={handleLogout}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Login/Register Buttons */}
                  <Link to="/login">
                    <button className="register" id="nav-eb-login" type="button">
                      <p>Đăng nhập</p>
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="login" id="nav-eb-register" type="button">
                      <p>Đăng ký</p>
                    </button>
                  </Link>
                </>
              )}

              {/* Language Dropdown */}
              <div className="dropdown">
                <button className="btn dropdown-toggle">
                  <img alt="" src="/assets/images/icons/vn.png" />
                </button>
                <ul className="dropdown-menu">
                  <li className="dropdown-item">
                    <div className="flag">
                      <img alt="" src="/assets/images/icons/en.png" />
                      <span>English</span>
                    </div>
                  </li>
                  <li className="dropdown-item">
                    <div className="flag">
                      <img alt="" src="/assets/images/icons/jp.png" />
                      <span>日本</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <header className={mobileMenuOpen ? 'active' : ''} id="nav-toggle">
        <div className="nav-toggle">
          <Link className="logo" to="/vi">
            <img 
              alt="HDBank" 
              src="https://cdn.hdbank.com.vn/hdbank-file/picture/logo_1645778839158.png" 
            />
          </Link>
          
          <div className="search-box">
            <form action="" method="post">
              <div className="form-group">
                <input 
                  type="text" 
                  className="searchinput" 
                  name="inputSearch" 
                  placeholder="Tìm kiếm" 
                />
                <button type="submit">
                  <img alt="HDBank" src="/assets/images/icons/search.png" />
                </button>
              </div>
            </form>
          </div>

          <div className="srcoll-bar">
            <div className="login">
              {(isAuthenticated && user) || localStorage.getItem('hdbank_token') || localStorage.getItem('customerId') ? (
                <div className="mobile-user">
                  <div className="mobile-user-info">
                    <div className="mobile-user-name">Xin chào, {fallbackUser?.username || 'Khách hàng'}</div>
                    <div className="mobile-user-segment">
                      {fallbackUser?.segment ? 
                        `${fallbackUser.segment} ${fallbackUser.age ? `• ${fallbackUser.age} tuổi` : ''}` : 
                        'Khách hàng HDBank'
                      }
                    </div>
                  </div>
                  <button className="mobile-logout" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <Link className="btn-login" to="/login">
                    <p>Đăng nhập</p>
                  </Link>
                  <Link className="btn-login" to="/register">
                    <p>Đăng ký</p>
                  </Link>
                </>
              )}
            </div>
            
            <div className="side-navigation-wrap">
              <ul className="side-navigation">
                <li className="active">
                  <div className="accordion-title">
                    <Link to="/vi/personal">Cá nhân</Link>
                  </div>
                </li>
                <li className="active">
                  <div className="accordion-title">
                    <Link to="/vi/corporate">Doanh nghiệp</Link>
                  </div>
                </li>
                <li className="active">
                  <div className="accordion-title">
                    <Link to="/vi/personal/priority">Khách hàng đặc biệt</Link>
                  </div>
                </li>
                <li className="active">
                  <div className="accordion-title">
                    <Link to="/vi/investor">Nhà đầu tư</Link>
                  </div>
                </li>
              </ul>
              <p className="copy-right">Bản quyền © 2024 thuộc về HDBank</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default HeaderOriginal;