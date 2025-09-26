import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ProductSlider.css';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  href: string;
  buttonText: string;
  buttonHref: string;
}

interface ProductSliderProps {
  category: 'personal' | 'corporate';
}

const personalProducts: Product[] = [
  {
    id: 1,
    name: 'HDBank Napas',
    description: 'Thẻ ghi nợ nội địa với nhiều tiện ích',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/334248266106827492742365267952_1677724904737.jpg',
    href: '/vi/personal/product/detail/the/the-ghi-no/hdbank-napas',
    buttonText: 'Mở thẻ ngay',
    buttonHref: 'https://online.hdbank.com.vn/products/gioi-thieu-mo-the'
  },
  {
    id: 2,
    name: 'HDBank MasterCard',
    description: 'Thẻ ghi nợ quốc tế MasterCard',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/MC_debit_new.jpg',
    href: '/vi/personal/product/detail/the/the-ghi-no/hdbank-mastercard',
    buttonText: 'Mở thẻ ngay',
    buttonHref: 'https://online.hdbank.com.vn/products/gioi-thieu-mo-the'
  },
  {
    id: 3,
    name: 'HDBank Visa',
    description: 'Thẻ ghi nợ quốc tế Visa',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/visa_new.jpg',
    href: '/vi/personal/product/detail/the/the-ghi-no/hdbank-visa',
    buttonText: 'Mở thẻ ngay',
    buttonHref: 'https://online.hdbank.com.vn/products/gioi-thieu-mo-the'
  },
  {
    id: 4,
    name: 'Tiết kiệm Online',
    description: 'Gửi tiết kiệm online với lãi suất ưu đãi',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/400x22861_1722847365193.jpg',
    href: '/vi/personal/product/detail/ngan-hang-dien-tu/tien-ich-chuc-nang/tiet-kiem-online',
    buttonText: 'Gửi tiết kiệm',
    buttonHref: 'https://online.hdbank.com.vn/products/tiet-kiem-online'
  },
  {
    id: 5,
    name: 'Vay Online',
    description: 'Vay tiền nhanh online lãi suất thấp nhất',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/HDMob375x380011679302368277_1719832554417.jpg',
    href: '/vi/personal/product/detail/ngan-hang-dien-tu/tien-ich-chuc-nang/vay-online',
    buttonText: 'Vay ngay',
    buttonHref: 'https://online.hdbank.com.vn/products/vay-online'
  }
];

const corporateProducts: Product[] = [
  {
    id: 1,
    name: 'eCredit - Cấp tín dụng doanh nghiệp online',
    description: 'Cấp tín dụng doanh nghiệp online nhanh chóng',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/HDMob375x38001_1679301970111.jpg',
    href: '/vi/corporate/product/detail/tin-dung/tai-tro-von-luu-dong/ecredit-cap-tin-dung-doanh-nghiep-online',
    buttonText: 'Đăng ký ngay',
    buttonHref: 'https://ecmb.hdbank.com.vn/Home/ChitietSP/?sp=ecredit'
  },
  {
    id: 2,
    name: 'eAccount - Tài khoản trực tuyến',
    description: 'Mở tài khoản doanh nghiệp trực tuyến',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/eAccount_mb_home.jpg',
    href: '/vi/corporate/product/detail/quan-ly-dong-tien/tien-gui/eaccount-tai-khoan-truc-tuyen',
    buttonText: 'Mở tài khoản',
    buttonHref: 'https://ecmb.hdbank.com.vn/Home/ChitietSP/?sp=eaccount'
  },
  {
    id: 3,
    name: 'HDBank Bemax - Tài khoản tối đa lợi ích',
    description: 'Tài khoản tối đa lợi ích cho doanh nghiệp',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/HDMob375x38001_1712032540755.jpg',
    href: '/vi/corporate/product/detail/quan-ly-dong-tien/tien-gui/tai-khoan-toi-da-loi-ich-hdbank-bemax',
    buttonText: 'Tìm hiểu thêm',
    buttonHref: '/vi/corporate/product/detail/quan-ly-dong-tien/tien-gui/tai-khoan-toi-da-loi-ich-hdbank-bemax'
  },
  {
    id: 4,
    name: 'Phái sinh giá cả hàng hóa',
    description: 'Công cụ phòng ngừa rủi ro do biến động giá cả hàng hóa',
    image: 'https://cdn.hdbank.com.vn/hdbank-file/product/thumbnailphaisinhhanghoamobile_1644395055945.jpg',
    href: '/vi/corporate/product/detail/ngoai-te-phai-sinh/giao-dich-phai-sinh/phai-sinh-gia-ca-hang-hoa',
    buttonText: 'Tìm hiểu thêm',
    buttonHref: '/vi/corporate/product/detail/ngoai-te-phai-sinh/giao-dich-phai-sinh/phai-sinh-gia-ca-hang-hoa'
  }
];

const ProductSlider: React.FC<ProductSliderProps> = ({ category }) => {
  const products = category === 'personal' ? personalProducts : corporateProducts;

  return (
    <div className="product-slider">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        className="products-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="product-card">
              <div className="product-image">
                <Link to={product.href}>
                  <img src={product.image} alt={product.name} />
                </Link>
              </div>
              <div className="product-content">
                <h4>
                  <Link to={product.href}>{product.name}</Link>
                </h4>
                <p>{product.description}</p>
                <a href={product.buttonHref} className="product-button">
                  {product.buttonText}
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <div className="swiper-button-next"></div>
      <div className="swiper-button-prev"></div>
    </div>
  );
};

export default ProductSlider;
