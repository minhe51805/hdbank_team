import React, { useState } from 'react';
import { formatCurrency, calculateLoanPayment } from '../../utils';
import './LoanCalculator.css';

interface ExchangeRate {
  currency: string;
  buy: number;
  sell: number;
  flag: string;
}

const exchangeRates: ExchangeRate[] = [
  { currency: 'USD', buy: 24100, sell: 24500, flag: '/assets/flags/USD.jpg' },
  { currency: 'EUR', buy: 26200, sell: 26800, flag: '/assets/flags/EUR.jpg' },
  { currency: 'GBP', buy: 30500, sell: 31200, flag: '/assets/flags/GBP.jpg' },
  { currency: 'JPY', buy: 162, sell: 172, flag: '/assets/flags/JPY.jpg' },
  { currency: 'AUD', buy: 16100, sell: 16700, flag: '/assets/flags/AUD.jpg' },
  { currency: 'CAD', buy: 17800, sell: 18400, flag: '/assets/flags/CAD.jpg' },
  { currency: 'CHF', buy: 27200, sell: 27800, flag: '/assets/flags/CHF.jpg' },
  { currency: 'CNY', buy: 3320, sell: 3420, flag: '/assets/flags/CNY.jpg' },
];

const LoanCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loan' | 'exchange'>('loan');
  const [loanAmount, setLoanAmount] = useState(500000000);
  const [loanTerm, setLoanTerm] = useState(60);
  const [interestRate, setInterestRate] = useState(7.5);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showResult, setShowResult] = useState(false);

  // Calculate loan payment
  const monthlyPayment = calculateLoanPayment(loanAmount, interestRate, loanTerm);
  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = totalPayment - loanAmount;

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setLoanAmount(Math.min(Math.max(value, 0), 10000000000));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoanAmount(parseInt(e.target.value));
  };

  const formatLoanAmount = (amount: number): string => {
    return amount.toLocaleString('vi-VN');
  };

  const selectedRate = exchangeRates.find(rate => rate.currency === selectedCurrency);

  return (
    <div className="card-tool-box">
      <div className="card-switcher">
        <ul className="header-switcher d-flex align-center">
          <li 
            className={activeTab === 'loan' ? 'active' : ''} 
            onClick={() => setActiveTab('loan')}
          >
            Ước tính khoản vay
          </li>
          <li 
            className={activeTab === 'exchange' ? 'active' : ''} 
            onClick={() => setActiveTab('exchange')}
          >
            Tỷ giá
          </li>
        </ul>

        {/* Loan Calculator Panel */}
        <div className={`panel ${activeTab === 'loan' ? 'active' : ''}`} id="panel-1">
          <div className="from-slide-loan">
            <form action="" method="post">
              <div className="form-group">
                <label htmlFor="amount">Số tiền vay </label>
                <input
                  id="amountTool"
                  className="textAmoutTool"
                  type="text"
                  autoComplete="off"
                  value={formatLoanAmount(loanAmount)}
                  onChange={handleLoanAmountChange}
                />
                <span className="color-red"> VNĐ</span>
              </div>
            </form>

            {/* Loan Amount Slider */}
            <div className="input-range">
              <span className="input-range__label input-range__label--min">
                <span className="input-range__label-container">0</span>
              </span>
              <div className="input-range__track input-range__track--background">
                <div 
                  className="input-range__track input-range__track--active"
                  style={{ 
                    left: '0%', 
                    width: `${(loanAmount / 10000000000) * 100}%` 
                  }}
                ></div>
                <span 
                  className="input-range__slider-container"
                  style={{ 
                    position: 'absolute', 
                    left: `${(loanAmount / 10000000000) * 100}%` 
                  }}
                >
                  <span className="input-range__label input-range__label--value">
                    <span className="input-range__label-container">{loanAmount}</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="10000000000"
                    step="10000000"
                    value={loanAmount}
                    onChange={handleSliderChange}
                    className="input-range__slider"
                  />
                </span>
              </div>
              <span className="input-range__label input-range__label--max">
                <span className="input-range__label-container">10 tỷ</span>
              </span>
            </div>

            {/* Loan Terms */}
            <div className="period-wraper">
              <table>
                <thead>
                  <tr className="labelPer">
                    <th>Kỳ hạn vay (tháng)</th>
                    <th>Lãi suất (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="qty-control">
                        <button 
                          type="button" 
                          className="qty-minus"
                          onClick={() => setLoanTerm(Math.max(12, loanTerm - 12))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(parseInt(e.target.value) || 12)}
                          min="12"
                          max="360"
                        />
                        <button 
                          type="button" 
                          className="qty-plus"
                          onClick={() => setLoanTerm(Math.min(360, loanTerm + 12))}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                        min="1"
                        max="20"
                        step="0.1"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculate Button */}
            <div className="btn-calculate">
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => setShowResult(true)}
              >
                Tính toán
              </button>
            </div>

            {/* Results */}
            {showResult && (
              <div className="calculation-result">
                <div className="result-item">
                  <span>Số tiền vay:</span>
                  <span>{formatCurrency(loanAmount)}</span>
                </div>
                <div className="result-item">
                  <span>Số tiền phải trả hàng tháng:</span>
                  <span className="highlight">{formatCurrency(monthlyPayment)}</span>
                </div>
                <div className="result-item">
                  <span>Tổng số tiền phải trả:</span>
                  <span>{formatCurrency(totalPayment)}</span>
                </div>
                <div className="result-item">
                  <span>Tổng tiền lãi:</span>
                  <span>{formatCurrency(totalInterest)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exchange Rate Panel */}
        <div className={`panel ${activeTab === 'exchange' ? 'active' : ''}`} id="panel-2">
          <form className="calculator">
            <div className="form-group d-flex">
              <div className="input-select">
                <img src={selectedRate?.flag} alt={selectedCurrency} />
                <select
                  id="money"
                  name="money"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {exchangeRates.map((rate) => (
                    <option key={rate.currency} value={rate.currency}>
                      {rate.currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="exchange-rates">
              <div className="rate-item">
                <span>Mua vào:</span>
                <span className="rate-value">{selectedRate?.buy.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="rate-item">
                <span>Bán ra:</span>
                <span className="rate-value">{selectedRate?.sell.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            <div className="exchange-note">
              <p>Tỷ giá chỉ mang tính chất tham khảo</p>
              <p>Cập nhật: {new Date().toLocaleString('vi-VN')}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
