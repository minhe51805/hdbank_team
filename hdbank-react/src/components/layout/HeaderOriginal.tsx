import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './HeaderOriginal.css';

const HeaderOriginal: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="nav-top">
      <nav>
        <div className="container">
          <div className="nav-full d-flex align-center">
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

            {/* Search Box */}
            <div className={`search-box ${searchOpen ? 'active' : ''}`} id="header-nav-top">
              <form className="searchform" id="searchform" action="" method="post">
                <div className="form-group">
                  <input 
                    type="text" 
                    className="searchinput" 
                    id="inputSearch" 
                    name="inputSearch" 
                    placeholder="Nhập từ khóa tìm kiếm..." 
                  />
                  <div className="close" onClick={toggleSearch}>
                    <img src="/assets/images/icons/close.png" alt="close" />
                  </div>
                  <button type="submit">
                    <img alt="" src="/assets/images/icons/search.png" />
                  </button>
                </div>
              </form>
              {/* <div className="searchIcon" onClick={toggleSearch}>
                <img alt="" src="/assets/images/icons/search.png" />
              </div> */}
            </div>

            {/* Right side elements */}
            <div className="header-right">
              {/* Authenticated User Menu or Login/Register Buttons */}
              {isAuthenticated && user ? (
                <div className="user-menu">
                  <button className="user-btn" onClick={toggleUserMenu}>
                    <span className="user-greeting">
                      Xin chào, {user.username}
                    </span>
                    <svg className={`user-arrow ${isUserMenuOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className="user-name">{user.username}</div>
                        <div className="user-segment">{user.segment} • {user.age} tuổi</div>
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
              {isAuthenticated && user ? (
                <div className="mobile-user">
                  <div className="mobile-user-info">
                    <div className="mobile-user-name">Xin chào, {user.username}</div>
                    <div className="mobile-user-segment">{user.segment} • {user.age} tuổi</div>
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
