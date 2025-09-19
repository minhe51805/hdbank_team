import React from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  href: string;
  icon: string;
}

const services: Service[] = [
  {
    id: 1,
    title: 'Mở tài khoản online',
    description: 'Mở tài khoản HDBank chỉ trong 3 phút với công nghệ eKYC hiện đại',
    image: '/assets/images/services/open-account.jpg',
    href: 'https://hdbank.onelink.me/wxE4/jhwrhd0d',
    icon: '/assets/images/icons/account.png'
  },
  {
    id: 2,
    title: 'Vay online',
    description: 'Vay tiền nhanh chóng với lãi suất ưu đãi từ 6.99%/năm',
    image: '/assets/images/services/loan-online.jpg',
    href: '/vi/personal/product/san-pham-vay',
    icon: '/assets/images/icons/loan.png'
  },
  {
    id: 3,
    title: 'Thẻ tín dụng',
    description: 'Thẻ tín dụng HDBank với nhiều ưu đãi hấp dẫn',
    image: '/assets/images/services/credit-card.jpg',
    href: '/vi/personal/product/the',
    icon: '/assets/images/icons/credit-card.png'
  },
  {
    id: 4,
    title: 'Chuyển tiền',
    description: 'Chuyển tiền miễn phí 24/7 qua HDBank Mobile Banking',
    image: '/assets/images/services/transfer.jpg',
    href: '/vi/personal/product/ngan-hang-dien-tu',
    icon: '/assets/images/icons/transfer.png'
  },
  {
    id: 5,
    title: 'Tiết kiệm online',
    description: 'Gửi tiết kiệm online với lãi suất cạnh tranh lên đến 6.8%/năm',
    image: '/assets/images/services/savings.jpg',
    href: '/vi/personal/product/san-pham-tien-gui',
    icon: '/assets/images/icons/savings.png'
  },
  {
    id: 6,
    title: 'Thanh toán hóa đơn',
    description: 'Thanh toán hóa đơn tiện lợi với nhiều ưu đãi',
    image: '/assets/images/services/bill-payment.jpg',
    href: '/vi/personal/product/ngan-hang-dien-tu',
    icon: '/assets/images/icons/bill.png'
  }
];

const Services: React.FC = () => {
  return (
    <div className="services-grid">
      {services.map((service, index) => (
        <div
          key={service.id}
          className="service-card card animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="service-icon">
            <img src={service.icon} alt={service.title} />
          </div>
          <div className="service-content">
            <h3 className="text-primary">{service.title}</h3>
            <p className="text-secondary">{service.description}</p>
            <Link to={service.href} className="service-link btn btn-secondary">
              Tìm hiểu thêm
              <span className="arrow lnr lnr-chevron-right"></span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Services;
