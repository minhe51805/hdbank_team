// Create 500 User Accounts in Batch (Fast Version)
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Password generation functions (same as before)
function generateUsername(customerId) {
  return `hdbank${String(customerId).padStart(4, '0')}`;
}

function generateEmail(customerId, segment) {
  const domain = 'customers.hdbank.vn';
  const prefix = `customer${String(customerId).padStart(4, '0')}`;
  return `${prefix}@${domain}`;
}

function generatePhone(customerId) {
  const prefix = '0908';
  const suffix = String(customerId).padStart(6, '0').slice(-6);
  return `${prefix}${suffix}`;
}

function generateSecurePassword(customerId, segment) {
  const segmentCode = {
    'family': 'FAM',
    'worker': 'WRK', 
    'student': 'STU',
    'senior': 'SNR',
    'other': 'OTH'
  };
  
  const code = segmentCode[segment] || 'CUS';
  const id = String(customerId).padStart(3, '0');
  return `HD${code}${id}2024@`;
}

async function createUsersBatch() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating 500 user accounts in batch mode...');
    
    // Get all customer profiles
    const customersResult = await client.query(`
      SELECT customer_id, segment, age
      FROM customer_profiles 
      ORDER BY customer_id
    `);
    
    console.log(`📊 Found ${customersResult.rows.length} customers`);
    
    // Prepare batch data
    console.log('🔄 Preparing user credentials...');
    const userBatches = [];
    const saltRounds = 12;
    
    // Process in smaller batches for memory efficiency
    const batchSize = 50;
    for (let i = 0; i < customersResult.rows.length; i += batchSize) {
      const batch = customersResult.rows.slice(i, i + batchSize);
      const batchPromises = batch.map(async (customer) => {
        const { customer_id, segment } = customer;
        
        const username = generateUsername(customer_id);
        const email = generateEmail(customer_id, segment);
        const phone = generatePhone(customer_id);
        const plainPassword = generateSecurePassword(customer_id, segment);
        const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
        
        return [customer_id, username, email, phone, passwordHash, 'active', false];
      });
      
      const batchData = await Promise.all(batchPromises);
      userBatches.push(batchData);
      
      console.log(`   Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(customersResult.rows.length/batchSize)}`);
    }
    
    console.log('💾 Inserting users into database...');
    
    await client.query('BEGIN');
    
    let totalInserted = 0;
    
    // Insert each batch
    for (let batchIndex = 0; batchIndex < userBatches.length; batchIndex++) {
      const batch = userBatches[batchIndex];
      
      // Create values string for batch insert
      const values = [];
      const placeholders = [];
      
      batch.forEach((user, index) => {
        const baseIndex = index * 7;
        placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7})`);
        values.push(...user);
      });
      
      const insertQuery = `
        INSERT INTO users (customer_id, username, email, phone, password_hash, status, password_changed)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (customer_id) DO NOTHING
      `;
      
      const result = await client.query(insertQuery, values);
      totalInserted += result.rowCount;
      
      console.log(`   ✅ Batch ${batchIndex + 1}: Inserted ${result.rowCount} users`);
    }
    
    await client.query('COMMIT');
    
    console.log(`\n🎉 Successfully created ${totalInserted} user accounts!`);
    
    // Show sample credentials
    const sampleUsers = await client.query(`
      SELECT u.customer_id, u.username, cp.segment
      FROM users u
      JOIN customer_profiles cp ON u.customer_id = cp.customer_id
      ORDER BY u.customer_id
      LIMIT 10
    `);
    
    console.log('\n🔑 Sample Login Credentials:');
    console.log('Username    | Password         | Customer ID | Segment');
    console.log('------------|------------------|-------------|--------');
    
    sampleUsers.rows.forEach(user => {
      const password = generateSecurePassword(user.customer_id, user.segment);
      console.log(`${user.username} | ${password.padEnd(16)} | ${String(user.customer_id).padStart(11)} | ${user.segment}`);
    });
    
    // Final statistics
    const finalStats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
      FROM users
    `);
    
    console.log('\n📊 Final Statistics:');
    console.log(`   Total Users Created: ${finalStats.rows[0].total_users}`);
    console.log(`   Active Users: ${finalStats.rows[0].active_users}`);
    
    console.log('\n✅ Batch user creation completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Batch creation error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  createUsersBatch()
    .then(() => {
      console.log('🎉 Batch process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Batch process failed:', error);
      process.exit(1);
    });
}

module.exports = createUsersBatch;
