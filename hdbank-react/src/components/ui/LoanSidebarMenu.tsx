import React from 'react';
import './LoanSidebarMenu.css';

interface MenuItemProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
}

interface LoanSidebarMenuProps {
  className?: string;
}

const LoanSidebarMenu: React.FC<LoanSidebarMenuProps> = ({ className = "" }) => {
  const menuItems: MenuItemProps[] = [
    {
      icon: '💳',
      title: 'Mở tài khoản',
      description: 'thanh toán',
      href: '/register'
    },
    {
      icon: '💰',
      title: 'Vay',
      description: 'trực tuyến',
      href: '/loan'
    },
    {
      icon: '🎴',
      title: 'Mở',
      description: 'thẻ ngay',
      href: '/card'
    }
  ];

  const handleItemClick = (item: MenuItemProps) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      // For now, just log the navigation
      console.log(`Navigate to: ${item.href}`);
    }
  };

  return (
    <div className={`loan-sidebar-menu ${className}`}>
      <div className="sidebar-menu-list">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className="sidebar-menu-item"
            onClick={() => handleItemClick(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleItemClick(item);
              }
            }}
          >
            <div className="menu-item-icon">
              {item.icon}
            </div>
            <div className="menu-item-content">
              <div className="menu-item-title">{item.title}</div>
              <div className="menu-item-description">{item.description}</div>
            </div>
            <div className="menu-item-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M6 12L10 8L6 4" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanSidebarMenu;