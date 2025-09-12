import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HeaderOriginal.css';

const HeaderOriginal: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
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
              <div className="searchIcon" onClick={toggleSearch}>
                <img alt="" src="/assets/images/icons/search.png" />
              </div>
            </div>

            {/* Login/Register Buttons */}
            <button className="register" id="nav-eb-login" type="button">
              <p>Đăng nhập</p>
            </button>
            <button className="login" id="nav-eb-register">
              <p>Đăng ký</p>
            </button>

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
              <Link className="btn-login" to="/register">
                <p>Đăng ký</p>
              </Link>
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
