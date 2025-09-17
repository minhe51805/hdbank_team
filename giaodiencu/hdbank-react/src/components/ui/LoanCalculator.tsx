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
    amount: 500000000,
    term: 60,
    interestRate: 7.5
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
    
    // Update slider background gradient
    const percentage = (newAmount / 10000000000) * 100;
    e.target.style.background = `linear-gradient(to right, #ef4444 0%, #ef4444 ${percentage}%, #e5e5e5 ${percentage}%, #e5e5e5 100%)`;
  };

  // Update term with buttons
  const handleTermChange = (increment: boolean) => {
    const newTerm = increment 
      ? Math.min(loanData.term + 12, 300)
      : Math.max(loanData.term - 12, 12);
    const newData = { ...loanData, term: newTerm };
    setLoanData(newData);
    setMonthlyPayment(calculateMonthlyPayment(newData));
  };

  // Update term with direct input
  const handleTermInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = parseInt(e.target.value) || 12;
    const clampedTerm = Math.min(Math.max(newTerm, 12), 300);
    const newData = { ...loanData, term: clampedTerm };
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

  // Update interest rate with buttons
  const handleInterestRateButtonChange = (increment: boolean) => {
    const newRate = increment 
      ? Math.min(loanData.interestRate + 0.1, 20)
      : Math.max(loanData.interestRate - 0.1, 1);
    const newData = { ...loanData, interestRate: parseFloat(newRate.toFixed(1)) };
    setLoanData(newData);
    setMonthlyPayment(calculateMonthlyPayment(newData));
  };

  // Calculate on mount and set initial slider gradient
  React.useEffect(() => {
    setMonthlyPayment(calculateMonthlyPayment(loanData));
    
    // Set initial slider gradient
    const slider = document.querySelector('.amount-slider') as HTMLInputElement;
    if (slider) {
      const percentage = (loanData.amount / 10000000000) * 100;
      slider.style.background = `linear-gradient(to right, #ef4444 0%, #ef4444 ${percentage}%, #e5e5e5 ${percentage}%, #e5e5e5 100%)`;
    }
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
            <input
              type="range"
              min="0"
              max="10000000000"
              step="50000000"
              value={loanData.amount}
              onChange={handleAmountChange}
              className="amount-slider"
            />
            <div className="slider-labels">
              <span>0 VND</span>
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
                type="number" 
                value={loanData.term}
                onChange={handleTermInputChange}
                min="12"
                max="300"
                step="12"
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
            <div className="interest-controls">
              <button 
                className="interest-btn minus"
                onClick={() => handleInterestRateButtonChange(false)}
              >
                −
              </button>
              <input 
                type="number" 
                value={loanData.interestRate}
                onChange={handleInterestRateChange}
                step="0.1"
                min="1"
                max="20"
                className="interest-input"
              />
              <button 
                className="interest-btn plus"
                onClick={() => handleInterestRateButtonChange(true)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="results-section">
          <div className="result-item">
            <span className="result-label">Trả hàng tháng</span>
            <div className="result-value-wrapper">
              <span className="result-value">{formatVND(monthlyPayment)}</span>
              <span className="result-currency">VND</span>
            </div>
          </div>
        </div>

        {/* Bottom Section with Note and Button */}
        <div className="bottom-section">
          <div className="bottom-note">
            <div className="note-line">Vay {loanData.term} tháng vay {formatVND(loanData.amount)} - Quy ra trả hàng tháng</div>
            <div className="note-line">Lãi suất vay {loanData.interestRate}%/năm - Hình thức trả nợ trả đều theo 602.476.2004 -</div>
            <div className="note-line">Tổng số phải trả {formatVND(monthlyPayment * loanData.term)}₫</div>
          </div>
          <button className="calculate-btn-compact">
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;