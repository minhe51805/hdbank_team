import React, { useState, useCallback } from 'react';
import './LoanCalculator.css';

interface LoanCalculatorProps {
  className?: string;
}

interface LoanData {
  amount: number;
  term: number;
  interestRate: number;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ className = "" }) => {
  const [loanData, setLoanData] = useState<LoanData>({
    amount: 1000000000,
    term: 48,
    interestRate: 7
  });

  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  // Vietnamese number formatting
  const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Calculate monthly payment
  const calculateMonthlyPayment = useCallback((data: LoanData): number => {
    const { amount, term, interestRate } = data;
    const monthlyRate = interestRate / 100 / 12;
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                   (Math.pow(1 + monthlyRate, term) - 1);
    return Math.round(payment);
  }, []);

  // Update loan amount from slider
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseInt(e.target.value);
    const newData = { ...loanData, amount: newAmount };
    setLoanData(newData);
    setMonthlyPayment(calculateMonthlyPayment(newData));
  };

  // Update term
  const handleTermChange = (increment: boolean) => {
    const newTerm = increment 
      ? Math.min(loanData.term + 12, 300)
      : Math.max(loanData.term - 12, 12);
    const newData = { ...loanData, term: newTerm };
    setLoanData(newData);
    setMonthlyPayment(calculateMonthlyPayment(newData));
  };

  // Update interest rate
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    const newData = { ...loanData, interestRate: newRate };
    setLoanData(newData);
    setMonthlyPayment(calculateMonthlyPayment(newData));
  };

  // Calculate on mount
  React.useEffect(() => {
    setMonthlyPayment(calculateMonthlyPayment(loanData));
  }, [calculateMonthlyPayment, loanData]);

  return (
    <div className={`loan-calculator ${className}`}>
      <div className="calculator-tabs">
        <button className="tab-button active">Công cụ tính khoản vay</button>
        <button className="tab-button inactive">Quy đổi tỷ giá</button>
      </div>

      <div className="calculator-content">
        {/* Loan Amount Section */}
        <div className="form-section">
          <div className="form-row">
            <label className="form-label">Số tiền vay</label>
            <div className="amount-display">
              <span className="amount-value">{formatVND(loanData.amount)}</span>
              <span className="currency">VND</span>
            </div>
          </div>

          {/* Amount Slider */}
          <div className="slider-container">
            <div className="slider-track">
              <div className="slider-fill" style={{
                width: `${(loanData.amount / 10000000000) * 100}%`
              }}></div>
              <input
                type="range"
                min="50000000"
                max="10000000000"
                step="50000000"
                value={loanData.amount}
                onChange={handleAmountChange}
                className="amount-slider"
              />
              <div className="slider-handle" style={{
                left: `${(loanData.amount / 10000000000) * 100}%`
              }}>
                <div className="slider-tooltip">
                  {formatVND(loanData.amount)}
                </div>
              </div>
            </div>
            <div className="slider-labels">
              <span>0</span>
              <span>10 tỷ</span>
            </div>
          </div>
        </div>

        {/* Term and Interest Rate */}
        <div className="form-row-group">
          <div className="form-section half-width">
            <label className="form-label">Kỳ hạn vay (tháng)</label>
            <div className="term-controls">
              <button 
                className="term-btn minus"
                onClick={() => handleTermChange(false)}
              >
                −
              </button>
              <input 
                type="text" 
                value={loanData.term}
                readOnly
                className="term-input"
              />
              <button 
                className="term-btn plus"
                onClick={() => handleTermChange(true)}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-section half-width">
            <label className="form-label">Lãi suất (%)</label>
            <input
              type="number"
              value={loanData.interestRate}
              onChange={handleInterestRateChange}
              step="0.1"
              min="1"
              max="20"
              className="interest-input"
            />
          </div>
        </div>

        {/* Results */}
        <div className="results-section">
          <div className="result-item">
            <span className="result-label">Trả hàng tháng</span>
            <span className="result-value">{formatVND(monthlyPayment)} VNĐ</span>
          </div>
          <div className="result-note">
            Xem bảng tính gốc và lãi tạm tính
          </div>
        </div>

        {/* Bottom Section with detailed info and button */}
        <div className="bottom-section">
          <div className="loan-details">
            <div className="detail-text">
              Số tiền vay: {formatVND(loanData.amount)} VNĐ<br />
              Kỳ hạn: {loanData.term} tháng | Lãi suất: {loanData.interestRate}%<br />
              <small>* Số liệu mang tính tham khảo, chưa bao gồm các loại phí</small>
            </div>
          </div>
          <button className="calculate-btn">
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;