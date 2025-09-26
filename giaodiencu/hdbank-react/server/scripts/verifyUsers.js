// Verify User Accounts and Database Statistics
const pool = require('../config/database');

async function verifyUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying user accounts and database statistics...\n');
    
    // Total users count
    const totalUsers = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total User Accounts: ${totalUsers.rows[0].count}`);
    
    // User status distribution
    const statusStats = await client.query(`
      SELECT status, COUNT(*) as count
      FROM users
      GROUP BY status
      ORDER BY count DESC
    `);
    
    console.log('\n📊 User Status Distribution:');
    statusStats.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count} users`);
    });
    
    // Customer segment distribution
    const segmentStats = await client.query(`
      SELECT cp.segment, COUNT(*) as user_count
      FROM users u
      JOIN customer_profiles cp ON u.customer_id = cp.customer_id
      GROUP BY cp.segment
      ORDER BY user_count DESC
    `);
    
    console.log('\n👥 Customer Segment Distribution:');
    segmentStats.rows.forEach(row => {
      console.log(`   ${row.segment}: ${row.user_count} users`);
    });
    
    // Age group distribution
    const ageStats = await client.query(`
      SELECT 
        CASE 
          WHEN cp.age < 25 THEN '18-24'
          WHEN cp.age < 35 THEN '25-34'
          WHEN cp.age < 45 THEN '35-44'
          WHEN cp.age < 55 THEN '45-54'
          ELSE '55+'
        END as age_group,
        COUNT(*) as count
      FROM users u
      JOIN customer_profiles cp ON u.customer_id = cp.customer_id
      GROUP BY age_group
      ORDER BY count DESC
    `);
    
    console.log('\n🎂 Age Group Distribution:');
    ageStats.rows.forEach(row => {
      console.log(`   ${row.age_group}: ${row.count} users`);
    });
    
    // Sample users for testing
    const sampleUsers = await client.query(`
      SELECT u.customer_id, u.username, u.email, u.phone, cp.segment, cp.age, cp.income
      FROM users u
      JOIN customer_profiles cp ON u.customer_id = cp.customer_id
      ORDER BY u.customer_id
      LIMIT 10
    `);
    
    console.log('\n🔑 Sample Login Credentials (Test Accounts):');
    console.log('Customer ID | Username    | Password         | Segment | Age | Income');
    console.log('------------|-------------|------------------|---------|-----|--------');
    
    sampleUsers.rows.forEach(user => {
      const segmentCode = {
        'family': 'FAM',
        'worker': 'WRK', 
        'student': 'STU',
        'senior': 'SNR',
        'other': 'OTH'
      };
      const code = segmentCode[user.segment] || 'CUS';
      const id = String(user.customer_id).padStart(3, '0');
      const password = `HD${code}${id}2024@`;
      
      console.log(`${String(user.customer_id).padStart(11)} | ${user.username} | ${password.padEnd(16)} | ${user.segment.padEnd(7)} | ${String(user.age).padStart(3)} | ${new Intl.NumberFormat('vi-VN').format(user.income)} VND`);
    });
    
    // Database integrity check
    const integrityCheck = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM customer_profiles) as profiles,
        (SELECT COUNT(*) FROM customer_labels) as labels,
        (SELECT COUNT(*) FROM customer_propensity) as propensity,
        (SELECT COUNT(*) FROM users u JOIN customer_profiles cp ON u.customer_id = cp.customer_id) as matched_users
    `);
    
    console.log('\n🔗 Database Integrity Check:');
    const stats = integrityCheck.rows[0];
    console.log(`   Users: ${stats.users}`);
    console.log(`   Customer Profiles: ${stats.profiles}`);
    console.log(`   Customer Labels: ${stats.labels}`);
    console.log(`   Customer Propensity: ${stats.propensity}`);
    console.log(`   Matched Users-Profiles: ${stats.matched_users}`);
    
    if (stats.users === stats.matched_users) {
      console.log('   ✅ All users have matching customer profiles');
    } else {
      console.log('   ⚠️ Some users missing customer profile data');
    }
    
    // High-value customers
    const highValueCustomers = await client.query(`
      SELECT u.username, cp.income, cp.balance_avg, cp.segment
      FROM users u
      JOIN customer_profiles cp ON u.customer_id = cp.customer_id
      WHERE cp.income > 15000000
      ORDER BY cp.income DESC
      LIMIT 5
    `);
    
    console.log('\n💰 Top 5 High-Value Customers:');
    console.log('Username    | Income (VND)    | Balance (VND)   | Segment');
    console.log('------------|-----------------|-----------------|--------');
    highValueCustomers.rows.forEach(customer => {
      console.log(`${customer.username} | ${new Intl.NumberFormat('vi-VN').format(customer.income).padEnd(15)} | ${new Intl.NumberFormat('vi-VN').format(customer.balance_avg).padEnd(15)} | ${customer.segment}`);
    });
    
    console.log('\n✅ User verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  verifyUsers()
    .then(() => {
      console.log('🎉 Verification completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = verifyUsers;
