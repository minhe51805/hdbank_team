import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PersonalPage.css';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
}

interface Plan {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  status: 'active' | 'completed' | 'paused';
}

interface ChartData {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

const PersonalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Get fallback user data from localStorage if needed
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
      return { 
        username, 
        customerId: parseInt(customerId), 
        segment: 'family', 
        age: 35,
        balance: 15750000,
        accountNumber: '0123456789'
      };
    }
    
    return null;
  }, [user]);

  // Mock data for demonstration
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        date: '2024-09-13',
        description: 'Chuyển khoản ATM',
        amount: -500000,
        type: 'debit',
        balance: 15750000
      },
      {
        id: '2',
        date: '2024-09-12',
        description: 'Lương tháng 9',
        amount: 12000000,
        type: 'credit',
        balance: 16250000
      },
      {
        id: '3',
        date: '2024-09-10',
        description: 'Thanh toán hóa đơn điện',
        amount: -1200000,
        type: 'debit',
        balance: 4250000
      },
      {
        id: '4',
        date: '2024-09-08',
        description: 'Tiền lãi tiết kiệm',
        amount: 350000,
        type: 'credit',
        balance: 5450000
      },
      {
        id: '5',
        date: '2024-09-05',
        description: 'Mua sắm online',
        amount: -750000,
        type: 'debit',
        balance: 5100000
      },
      {
        id: '6',
        date: '2024-09-03',
        description: 'Chuyển khoản từ bạn bè',
        amount: 2000000,
        type: 'credit',
        balance: 5850000
      },
      {
        id: '7',
        date: '2024-09-01',
        description: 'Thanh toán thẻ tín dụng',
        amount: -3500000,
        type: 'debit',
        balance: 3850000
      }
    ];

    const mockPlans: Plan[] = [
      {
        id: '1',
        name: 'Kế hoạch tiết kiệm mua nhà',
        target: 500000000,
        current: 125000000,
        deadline: '2025-12-31',
        status: 'active'
      },
      {
        id: '2',
        name: 'Quỹ giáo dục con em',
        target: 200000000,
        current: 85000000,
        deadline: '2026-06-30',
        status: 'active'
      },
      {
        id: '3',
        name: 'Du lịch gia đình',
        target: 50000000,
        current: 50000000,
        deadline: '2024-12-25',
        status: 'completed'
      },
      {
        id: '4',
        name: 'Đầu tư chứng khoán',
        target: 100000000,
        current: 35000000,
        deadline: '2025-06-30',
        status: 'active'
      }
    ];

    const mockChartData: ChartData[] = [
      { month: 'T1', income: 12000000, expense: 8500000, savings: 3500000 },
      { month: 'T2', income: 12000000, expense: 9200000, savings: 2800000 },
      { month: 'T3', income: 12500000, expense: 8800000, savings: 3700000 },
      { month: 'T4', income: 12000000, expense: 9500000, savings: 2500000 },
      { month: 'T5', income: 13000000, expense: 9000000, savings: 4000000 },
      { month: 'T6', income: 12000000, expense: 8700000, savings: 3300000 },
      { month: 'T7', income: 12000000, expense: 9100000, savings: 2900000 },
      { month: 'T8', income: 12500000, expense: 8600000, savings: 3900000 },
      { month: 'T9', income: 12000000, expense: 8900000, savings: 3100000 }
    ];

    setTransactions(mockTransactions);
    setPlans(mockPlans);
    setChartData(mockChartData);
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const openBlockchainExplorer = () => {
    // Mock blockchain explorer - could link to real blockchain explorer
    window.open('https://etherscan.io/', '_blank');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="personal-page">
      <div className="container">
        {/* User Info Header */}
        <div className="profile-header">
          <div className="user-avatar-large">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="user-info-header">
            <h1>Xin chào, {fallbackUser?.username || 'Khách hàng'}!</h1>
            <p className="user-segment">
              Khách hàng {fallbackUser?.segment || 'cá nhân'} 
              {fallbackUser?.age && ` • ${fallbackUser.age} tuổi`}
            </p>
            <p className="account-number">
              STK: {fallbackUser?.accountNumber || '0123456789'}
            </p>
          </div>
          <div className="profile-actions">
            <button className="btn-blockchain" onClick={openBlockchainExplorer}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M9 9h6v6h-6z"></path>
              </svg>
              Blockchain Explorer
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Tổng quan
          </button>
          <button 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Lịch sử giao dịch
          </button>
          <button 
            className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            Kế hoạch tài chính
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Phân tích chi tiết
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Current Balance */}
              <div className="balance-card">
                <div className="card-header">
                  <h3>Số dư hiện tại</h3>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div className="balance-amount">
                  {formatCurrency(fallbackUser?.balance || 15750000)}
                </div>
                <div className="balance-subtitle">
                  Tài khoản thanh toán chính
                </div>
              </div>

              {/* Quick Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{transactions.filter(t => t.type === 'credit').length}</div>
                  <div className="stat-label">Giao dịch thu</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{transactions.filter(t => t.type === 'debit').length}</div>
                  <div className="stat-label">Giao dịch chi</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{plans.filter(p => p.status === 'active').length}</div>
                  <div className="stat-label">Kế hoạch đang thực hiện</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{formatCurrency(
                    chartData.reduce((sum, data) => sum + data.savings, 0)
                  )}</div>
                  <div className="stat-label">Tổng tiết kiệm</div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="recent-transactions">
                <h3>Giao dịch gần đây</h3>
                <div className="transaction-list">
                  {transactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          {transaction.type === 'credit' ? (
                            <path d="M7 13l3 3 7-7" />
                          ) : (
                            <path d="M18 6L6 18M6 6l12 12" />
                          )}
                        </svg>
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-description">{transaction.description}</div>
                        <div className="transaction-date">{formatDate(transaction.date)}</div>
                      </div>
                      <div className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="transactions-tab">
              <div className="transactions-header">
                <h3>Lịch sử giao dịch</h3>
                <div className="transaction-filters">
                  <select className="filter-select">
                    <option value="all">Tất cả giao dịch</option>
                    <option value="credit">Giao dịch thu</option>
                    <option value="debit">Giao dịch chi</option>
                  </select>
                  <input type="date" className="date-filter" />
                </div>
              </div>
              
              <div className="transactions-table">
                <div className="table-header">
                  <div>Ngày</div>
                  <div>Mô tả</div>
                  <div>Số tiền</div>
                  <div>Số dư</div>
                </div>
                
                {transactions.map(transaction => (
                  <div key={transaction.id} className="table-row">
                    <div className="transaction-date">{formatDate(transaction.date)}</div>
                    <div className="transaction-description">{transaction.description}</div>
                    <div className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div className="transaction-balance">{formatCurrency(transaction.balance)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="plans-tab">
              <div className="plans-header">
                <h3>Kế hoạch tài chính</h3>
                <button className="btn-add-plan">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Thêm kế hoạch
                </button>
              </div>
              
              <div className="plans-grid">
                {plans.map(plan => (
                  <div key={plan.id} className={`plan-card ${plan.status}`}>
                    <div className="plan-header">
                      <h4>{plan.name}</h4>
                      <span className={`plan-status ${plan.status}`}>
                        {plan.status === 'active' ? 'Đang thực hiện' : 
                         plan.status === 'completed' ? 'Hoàn thành' : 'Tạm dừng'}
                      </span>
                    </div>
                    
                    <div className="plan-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(plan.current / plan.target) * 100}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {formatCurrency(plan.current)} / {formatCurrency(plan.target)}
                      </div>
                    </div>
                    
                    <div className="plan-details">
                      <div className="plan-deadline">
                        Mục tiêu: {formatDate(plan.deadline)}
                      </div>
                      <div className="plan-percentage">
                        {Math.round((plan.current / plan.target) * 100)}% hoàn thành
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <div className="analytics-header">
                <h3>Phân tích chi tiết</h3>
                <p>Biểu đồ và thống kê về tình hình tài chính của bạn</p>
              </div>
              
              {/* Income vs Expense Chart */}
              <div className="chart-section">
                <h4>Thu chi theo tháng</h4>
                <div className="chart-container">
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-color income"></span>
                      <span>Thu nhập</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color expense"></span>
                      <span>Chi tiêu</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color savings"></span>
                      <span>Tiết kiệm</span>
                    </div>
                  </div>
                  <div className="chart-bars">
                    {chartData.map((data, index) => (
                      <div key={index} className="chart-month">
                        <div className="chart-bars-group">
                          <div 
                            className="chart-bar income" 
                            style={{ height: `${(data.income / 15000000) * 100}%` }}
                            title={`Thu nhập: ${formatCurrency(data.income)}`}
                          ></div>
                          <div 
                            className="chart-bar expense" 
                            style={{ height: `${(data.expense / 15000000) * 100}%` }}
                            title={`Chi tiêu: ${formatCurrency(data.expense)}`}
                          ></div>
                          <div 
                            className="chart-bar savings" 
                            style={{ height: `${(data.savings / 15000000) * 100}%` }}
                            title={`Tiết kiệm: ${formatCurrency(data.savings)}`}
                          ></div>
                        </div>
                        <div className="chart-month-label">{data.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financial Insights */}
              <div className="insights-section">
                <h4>Thống kê tài chính</h4>
                <div className="insights-grid">
                  <div className="insight-card positive">
                    <div className="insight-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                        <polyline points="17,6 23,6 23,12"></polyline>
                      </svg>
                    </div>
                    <div className="insight-content">
                      <div className="insight-title">Xu hướng tiết kiệm</div>
                      <div className="insight-value">+12.5%</div>
                      <div className="insight-description">So với tháng trước</div>
                    </div>
                  </div>
                  
                  <div className="insight-card neutral">
                    <div className="insight-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    </div>
                    <div className="insight-content">
                      <div className="insight-title">Chi tiêu trung bình</div>
                      <div className="insight-value">{formatCurrency(
                        chartData.reduce((sum, data) => sum + data.expense, 0) / chartData.length
                      )}</div>
                      <div className="insight-description">Mỗi tháng</div>
                    </div>
                  </div>
                  
                  <div className="insight-card positive">
                    <div className="insight-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <div className="insight-content">
                      <div className="insight-title">Hiệu quả tiết kiệm</div>
                      <div className="insight-value">28.3%</div>
                      <div className="insight-description">Tỷ lệ tiết kiệm/thu nhập</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
