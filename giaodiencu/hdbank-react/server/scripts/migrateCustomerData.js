// Migrate Customer Data from CSV files to PostgreSQL
const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../config/database');

// CSV file paths
const FEATURES_CSV = '../model/features_monthly.csv';
const LABELS_CSV = '../model/labels.csv';
const PREDICTIONS_CSV = '../model/predictions_llm_with_facts.csv';

// Read CSV files and insert into database
async function migrateCustomerData() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting customer data migration...');
    
    await client.query('BEGIN');
    
    // 1. Migrate customer profiles (features_monthly.csv)
    console.log('📊 Migrating customer profiles...');
    const profilesData = await readCSV(FEATURES_CSV);
    let profileCount = 0;
    
    for (const row of profilesData) {
      const insertProfileQuery = `
        INSERT INTO customer_profiles (
          customer_id, year_month, age, segment, income, spend, balance_avg, loan,
          digital_logins_30d, incoming_tx_cnt_30d, outgoing_tx_cnt_30d, salary_variance,
          balance_trend_90d, spend_travel, spend_food_grocery, spend_entertainment,
          spend_education, spend_utilities, spend_health, spend_shopping,
          travel_tx_cnt_90d, recency_last_travel_days, bill_autopay_active, failed_payments_90d,
          payday_cadence_days, days_since_last_payday, season_flag, upcoming_bill_due_days,
          balance_ratio, surplus, spend_ratio, dti, cashflow_volatility, liquidity_buffer,
          digital_index, inflow_baseline_90d, max_inflow_z_30d, max_inflow_pct_30d,
          large_inflow_flag_7d, days_since_large_inflow
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40
        ) ON CONFLICT (customer_id) DO NOTHING
      `;
      
      const values = [
        row.customer_id, row.year_month, row.age, row.segment, row.income, row.spend,
        row.balance_avg, row.loan, row.digital_logins_30d, row.incoming_tx_cnt_30d,
        row.outgoing_tx_cnt_30d, row.salary_variance, row.balance_trend_90d, row.spend_travel,
        row.spend_food_grocery, row.spend_entertainment, row.spend_education, row.spend_utilities,
        row.spend_health, row.spend_shopping, row.travel_tx_cnt_90d, row.recency_last_travel_days,
        row.bill_autopay_active, row.failed_payments_90d, row.payday_cadence_days, row.days_since_last_payday,
        row.season_flag, row.upcoming_bill_due_days, row.balance_ratio, row.surplus,
        row.spend_ratio, row.dti, row.cashflow_volatility, row.liquidity_buffer,
        row.digital_index, row.inflow_baseline_90d, row.max_inflow_z_30d, row.max_inflow_pct_30d,
        row.large_inflow_flag_7d, row.days_since_large_inflow
      ];
      
      await client.query(insertProfileQuery, values);
      profileCount++;
    }
    
    console.log(`✅ Migrated ${profileCount} customer profiles`);
    
    // 2. Migrate customer labels (labels.csv)
    console.log('🏷️ Migrating customer labels...');
    const labelsData = await readCSV(LABELS_CSV);
    let labelCount = 0;
    
    for (const row of labelsData) {
      const insertLabelQuery = `
        INSERT INTO customer_labels (customer_id, year_month, label_interest)
        VALUES ($1, $2, $3)
        ON CONFLICT (customer_id) DO NOTHING
      `;
      
      await client.query(insertLabelQuery, [row.customer_id, row.year_month, row.label_interest]);
      labelCount++;
    }
    
    console.log(`✅ Migrated ${labelCount} customer labels`);
    
    // 3. Migrate customer propensity predictions (predictions_llm_with_facts.csv)
    console.log('🎯 Migrating customer propensity data...');
    const propensityData = await readCSV(PREDICTIONS_CSV);
    let propensityCount = 0;
    
    for (const row of propensityData) {
      const insertPropensityQuery = `
        INSERT INTO customer_propensity (customer_id, probability, decision, facts, explanation)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (customer_id) DO NOTHING
      `;
      
      await client.query(insertPropensityQuery, [
        row.customer_id, 
        row.probability, 
        row.decision, 
        row.facts, 
        row.explanation
      ]);
      propensityCount++;
    }
    
    console.log(`✅ Migrated ${propensityCount} customer propensity predictions`);
    
    await client.query('COMMIT');
    
    // Verify data
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM customer_profiles) as profiles,
        (SELECT COUNT(*) FROM customer_labels) as labels,
        (SELECT COUNT(*) FROM customer_propensity) as propensity
    `);
    
    console.log('📊 Migration Summary:');
    console.log(`   Customer Profiles: ${counts.rows[0].profiles}`);
    console.log(`   Customer Labels: ${counts.rows[0].labels}`);
    console.log(`   Customer Propensity: ${counts.rows[0].propensity}`);
    console.log('✅ Customer data migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Helper function to read CSV files
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Execute if run directly
if (require.main === module) {
  migrateCustomerData()
    .then(() => {
      console.log('🎉 Data migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Data migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateCustomerData;
