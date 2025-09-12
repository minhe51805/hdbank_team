// Create Database Tables for HDBank Customer Authentication
const pool = require('../config/database');

const createTablesSQL = `
-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT FALSE,
    password_changed BOOLEAN DEFAULT FALSE
);

-- Customer profiles from features_monthly.csv
CREATE TABLE IF NOT EXISTS customer_profiles (
    customer_id INTEGER PRIMARY KEY,
    year_month VARCHAR(7) NOT NULL,
    age INTEGER,
    segment VARCHAR(20),
    income DECIMAL(15,2),
    spend DECIMAL(15,2),
    balance_avg DECIMAL(15,2),
    loan DECIMAL(15,2),
    digital_logins_30d INTEGER,
    incoming_tx_cnt_30d INTEGER,
    outgoing_tx_cnt_30d INTEGER,
    salary_variance DECIMAL(15,2),
    balance_trend_90d DECIMAL(10,6),
    spend_travel DECIMAL(15,2),
    spend_food_grocery DECIMAL(15,2),
    spend_entertainment DECIMAL(15,2),
    spend_education DECIMAL(15,2),
    spend_utilities DECIMAL(15,2),
    spend_health DECIMAL(15,2),
    spend_shopping DECIMAL(15,2),
    travel_tx_cnt_90d INTEGER,
    recency_last_travel_days INTEGER,
    bill_autopay_active INTEGER,
    failed_payments_90d INTEGER,
    payday_cadence_days INTEGER,
    days_since_last_payday INTEGER,
    season_flag VARCHAR(20),
    upcoming_bill_due_days INTEGER,
    balance_ratio DECIMAL(10,6),
    surplus DECIMAL(15,2),
    spend_ratio DECIMAL(10,6),
    dti DECIMAL(10,6),
    cashflow_volatility DECIMAL(10,6),
    liquidity_buffer DECIMAL(10,6),
    digital_index DECIMAL(10,6),
    inflow_baseline_90d DECIMAL(15,2),
    max_inflow_z_30d DECIMAL(10,6),
    max_inflow_pct_30d DECIMAL(10,6),
    large_inflow_flag_7d INTEGER,
    days_since_large_inflow INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer labels from labels.csv
CREATE TABLE IF NOT EXISTS customer_labels (
    customer_id INTEGER PRIMARY KEY,
    year_month VARCHAR(7) NOT NULL,
    label_interest INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer propensity predictions
CREATE TABLE IF NOT EXISTS customer_propensity (
    customer_id INTEGER PRIMARY KEY,
    probability DECIMAL(10,8),
    decision VARCHAR(10),
    facts TEXT,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_segment ON customer_profiles(segment);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_age ON customer_profiles(age);
CREATE INDEX IF NOT EXISTS idx_customer_propensity_decision ON customer_propensity(decision);

-- Add foreign key constraints
ALTER TABLE customer_profiles 
ADD CONSTRAINT fk_customer_profiles_customer_id 
FOREIGN KEY (customer_id) REFERENCES users(customer_id) 
ON DELETE CASCADE;

ALTER TABLE customer_labels 
ADD CONSTRAINT fk_customer_labels_customer_id 
FOREIGN KEY (customer_id) REFERENCES users(customer_id) 
ON DELETE CASCADE;

ALTER TABLE customer_propensity 
ADD CONSTRAINT fk_customer_propensity_customer_id 
FOREIGN KEY (customer_id) REFERENCES users(customer_id) 
ON DELETE CASCADE;
`;

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating HDBank database tables...');
    
    await client.query('BEGIN');
    await client.query(createTablesSQL);
    await client.query('COMMIT');
    
    console.log('✅ All tables created successfully!');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Created Tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = createTables;
