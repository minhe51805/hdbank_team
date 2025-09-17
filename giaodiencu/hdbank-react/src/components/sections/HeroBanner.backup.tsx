import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';
import LoanCalculator from './LoanCalculator';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './HeroBanner.css';

interface BannerSlide {
  id: number;
  image: string;
  href: string;
  buttons: {
    text: string;
    href: string;
  }[];
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: 'https://cdn.hdbank.com.vn/hdbank-file/banner/1000x17171_1755573621159.jpg',
    href: '/',
    buttons: [
      { text: 'Mở tài khoản thanh toán', href: 'https://hdbank.onelink.me/wxE4/jhwrhd0d' },
      { text: 'Mở thẻ ngay', href: 'https://hdbank.com.vn/s/card_register' },
    ],
  },
  {
    id: 2,
    image: 'https://cdn.hdbank.com.vn/hdbank-file/banner/1000x1717MobileangTrangChu_1742802764080.jpg',
    href: 'https://hdbank.com.vn/vi/personal/product/detail/san-pham-vay/vay-bat-dong-san/vay-bat-dong-san',
    buttons: [
      { text: 'Mở tài khoản thanh toán', href: 'https://hdbank.onelink.me/wxE4/jhwrhd0d' },
      { text: 'Vay trực tuyến', href: 'https://hdbank.com.vn/vi/personal/product/detail/san-pham-vay/vay-bat-dong-san/vay-bat-dong-san' },
      { text: 'Mở thẻ ngay', href: 'https://hdbank.com.vn/s/card_register' },
    ],
  },
  {
    id: 3,
    image: 'https://cdn.hdbank.com.vn/hdbank-file/banner/doc_1754625012445.jpg',
    href: 'https://go.isclix.com/deep_link/v5/6612490012457672081/6436091579075160787?utm_source=TLHMart&utm_medium=cpc&utm_campaign=muadee1&sub4=oneatweb&url_enc=aHR0cHM6Ly9tdWFkZWUucGFnZS5saW5r',
    buttons: [
      { text: 'Mở thanh toán', href: 'https://go.isclix.com/deep_link/v5/6612490012457672081/6436091579075160787?utm_source=TLHMart&utm_medium=cpc&utm_campaign=muadee1&sub4=oneatweb&url_enc=aHR0cHM6Ly9tdWFkZWUucGFnZS5saW5r' },
    ],
  },
  {
    id: 4,
    image: 'https://cdn.hdbank.com.vn/hdbank-file/banner/1000x1717_1712029980463.jpg',
    href: 'https://hdbank.com.vn/vi/corporate/product/detail/quan-ly-dong-tien/tien-gui/goi-chi-luong-happy-di-payroll?utm_source=HDB-payrolls3-NA-ALL-owned-NA-HDTW-NA-WBA-ALL&utm_medium=NA&utm_campaign=S3',
    buttons: [
      { text: 'Vay trực tuyến', href: '/vi/personal/product/san-pham-vay' },
      { text: 'Mở tài khoản thanh toán', href: 'https://hdbank.onelink.me/wxE4/jhwrhd0d' },
      { text: 'Mở thẻ ngay', href: 'https://hdbank.com.vn/s/card_register' },
    ],
  },
  {
    id: 5,
    image: 'https://cdn.hdbank.com.vn/hdbank-file/banner/TruyenthongJCB1000x1717trangchu_1715327241695.jpg',
    href: 'https://hdbank.com.vn/s/card_register',
    buttons: [
      { text: 'Mở tài khoản thanh toán', href: 'https://hdbank.onelink.me/wxE4/jhwrhd0d' },
      { text: 'Mở thẻ ngay', href: 'https://hdbank.com.vn/s/card_register' },
    ],
  },
  {
    id: 6,
    image: 'https://cdn.hdbank.com.vn/hdbank-file/banner/1000x1717_1744364588284.jpg',
    href: 'https://hdbank.com.vn/vi/news/detail/tin-tuc/vietcombank-vietinbank-bidv-hdbank-duoc-vinh-danh-thuong-hieu-quoc-gia?utm_source=HDB-NA-NA-ALL-owned-TR-HDTW-NA-NA-ALL&utm_medium=NA&utm_campaign=Thuonghieuquocgia2024',
    buttons: [
      { text: 'Mở tài khoản thanh toán', href: 'https://hdbank.onelink.me/wxE4/jhwrhd0d' },
      { text: 'Mở thẻ ngay', href: 'https://hdbank.com.vn/vi/personal/product/the' },
    ],
  },
];

const HeroBanner: React.FC = () => {
  const swiperRef = useRef<any>(null);

  return (
    <section className="home-banner">
      <div 
        className="swiper-container"
        style={{
          backgroundImage: 'url(/assets/images/bg-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <Swiper
          ref={swiperRef}
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
          }}
          loop={true}
          className="swiper swiper-fade"
        >
          {bannerSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="hero-image">
                <Link to={slide.href}>
                  <img 
                    alt="HDBank" 
                    src={slide.image} 
                    className="desktop"
                  />
                </Link>
                
                <div className="product-list-slide">
                  <ul>
                    {slide.buttons.map((button, index) => (
                      <li key={index}>
                        <a href={button.href}>
                          <p>
                            <span>{button.text.split(' ')[0]} </span>
                            <br />
                            {button.text.split(' ').slice(1).join(' ')}
                          </p>
                          <em className="lnr lnr-chevron-right"></em>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Loan Calculator - Inside Hero Banner like original */}
      <LoanCalculator />

      {/* Marquee Section */}
      <div className="marquee-parent">
        <div className="marquee-wrapper">
          <div className="marquee_text marquee-container">
            <div className="marquee">
              <div className="marquee-list_item">
                <span>⚡</span>
                <span>Mở tài khoản online miễn phí - Nhận ngay 200.000 VNĐ</span>
              </div>
              <div className="marquee-list_item">
                <span>🎁</span>
                <span>Thẻ tín dụng HDBank - Hoàn tiền lên đến 8%</span>
              </div>
              <div className="marquee-list_item">
                <span>💰</span>
                <span>Vay online lãi suất từ 6.99%/năm</span>
              </div>
              <div className="marquee-list_item">
                <span>🏆</span>
                <span>HDBank - Ngân hàng số hàng đầu Việt Nam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
