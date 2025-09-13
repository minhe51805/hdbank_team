// Authentication Controller for HDBank
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Login function
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
      });
    }

    console.log(`🔍 Login attempt for username: ${username}`);

    // Find user in database - using simple approach for testing
    // First check if a simple test user table exists
    let userQuery = `
      SELECT 1 as id, 1 as customer_id, $1 as username, '123456' as password,
             'active' as status, false as account_locked, 0 as login_attempts, 
             true as password_changed, NOW() as last_login,
             'family' as segment, 35 as age, 50000 as income, 100000 as balance_avg
      WHERE $1 = 'khachhang1'
      UNION ALL
      SELECT 2 as id, 2 as customer_id, $1 as username, '123456' as password,
             'active' as status, false as account_locked, 0 as login_attempts, 
             true as password_changed, NOW() as last_login,
             'worker' as segment, 28 as age, 40000 as income, 80000 as balance_avg
      WHERE $1 = 'khachhang2'
      UNION ALL
      SELECT 3 as id, 3 as customer_id, $1 as username, '123456' as password,
             'active' as status, false as account_locked, 0 as login_attempts, 
             true as password_changed, NOW() as last_login,
             'student' as segment, 22 as age, 15000 as income, 25000 as balance_avg
      WHERE $1 = 'khachhang3'
    `;
    
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      console.log(`❌ User not found: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.account_locked) {
      console.log(`🔒 Account locked: ${username}`);
      return res.status(423).json({
        success: false,
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      console.log(`⚠️ Account not active: ${username}`);
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa được kích hoạt.'
      });
    }

    // Verify password (customer_accounts uses plain text passwords)
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${username}`);
      
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    console.log(`✅ Login successful for: ${username}`);

    // Update last login (optional, since customer_accounts is simple)
    // await pool.query(
    //   'UPDATE customer_accounts SET updated_at = NOW() WHERE customer_id = $1',
    //   [user.customer_id]
    // );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.customer_id,
        customerId: user.customer_id,
        username: user.username,
        segment: user.segment
      },
      process.env.JWT_SECRET || 'hdbank_jwt_secret_key_2024_very_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Prepare user data (excluding sensitive info)
    const userData = {
      id: user.customer_id,
      customerId: user.customer_id,
      username: user.username,
      email: `customer${user.customer_id.toString().padStart(4, '0')}@customers.hdbank.vn`,
      phone: `0908${user.customer_id.toString().padStart(6, '0')}`,
      status: user.status,
      segment: user.segment,
      age: user.age,
      income: user.income,
      balance: user.balance_avg,
      passwordChanged: user.password_changed,
      lastLogin: user.last_login
    };

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: userData,
      requirePasswordChange: !user.password_changed
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profileQuery = `
      SELECT u.*, cp.*, cl.label_interest, cr.probability, cr.decision
      FROM users u
      LEFT JOIN customer_profiles cp ON u.customer_id = cp.customer_id
      LEFT JOIN customer_labels cl ON u.customer_id = cl.customer_id
      LEFT JOIN customer_propensity cr ON u.customer_id = cr.customer_id
      WHERE u.id = $1
    `;

    const result = await pool.query(profileQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    const profile = result.rows[0];

    // Remove sensitive data
    delete profile.password_hash;
    delete profile.login_attempts;

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng'
    });
  }
};

// Logout function
const logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng xuất'
    });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    // If middleware passed, token is valid
    res.json({
      success: true,
      message: 'Token hợp lệ',
      user: req.user
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực token'
    });
  }
};

module.exports = {
  login,
  getProfile,
  logout,
  verifyToken
};
