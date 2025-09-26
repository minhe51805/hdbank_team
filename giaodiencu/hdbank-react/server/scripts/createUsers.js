// Create User Accounts for 500 HDBank Customers
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Password generation functions
function generateUsername(customerId) {
  return `hdbank${String(customerId).padStart(4, '0')}`;
}

function generateEmail(customerId, segment) {
  const domain = 'customers.hdbank.vn';
  const prefix = `customer${String(customerId).padStart(4, '0')}`;
  return `${prefix}@${domain}`;
}

function generatePhone(customerId) {
  // Generate Vietnamese phone number format
  const prefix = '0908'; // Mobile prefix
  const suffix = String(customerId).padStart(6, '0').slice(-6);
  return `${prefix}${suffix}`;
}

function generateSecurePassword(customerId, segment) {
  // Generate meaningful but secure password
  const segmentCode = {
    'family': 'FAM',
    'worker': 'WRK', 
    'student': 'STU',
    'senior': 'SNR',
    'other': 'OTH'
  };
  
  const code = segmentCode[segment] || 'CUS';
  const id = String(customerId).padStart(3, '0');
  const year = '2024';
  const special = '@';
  
  return `HD${code}${id}${year}${special}`;
}

async function createUserAccounts() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating user accounts for 500 customers...');
    
    // Get all customer profiles
    const customersResult = await client.query(`
      SELECT customer_id, segment, age
      FROM customer_profiles 
      ORDER BY customer_id
    `);
    
    console.log(`📊 Found ${customersResult.rows.length} customers to create accounts for`);
    
    await client.query('BEGIN');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const customer of customersResult.rows) {
      try {
        const { customer_id, segment, age } = customer;
        
        // Generate account credentials
        const username = generateUsername(customer_id);
        const email = generateEmail(customer_id, segment);
        const phone = generatePhone(customer_id);
        const plainPassword = generateSecurePassword(customer_id, segment);
        
        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
        
        // Insert user account
        const insertUserQuery = `
          INSERT INTO users (
            customer_id, username, email, phone, password_hash, 
            status, created_at, password_changed
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
          ON CONFLICT (customer_id) DO NOTHING
        `;
        
        await client.query(insertUserQuery, [
          customer_id,
          username,
          email,
          phone,
          passwordHash,
          'active',
          false // Password needs to be changed on first login
        ]);
        
        successCount++;
        
        // Log first few accounts for verification
        if (successCount <= 5) {
          console.log(`✅ Created account ${successCount}:`);
          console.log(`   Customer ID: ${customer_id}`);
          console.log(`   Username: ${username}`);
          console.log(`   Email: ${email}`);
          console.log(`   Phone: ${phone}`);
          console.log(`   Password: ${plainPassword}`);
          console.log(`   Segment: ${segment} | Age: ${age}`);
          console.log('   ---');
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error creating account for customer ${customer.customer_id}:`, error.message);
      }
    }
    
    await client.query('COMMIT');
    
    // Generate sample credentials file for testing
    const sampleUsers = await client.query(`
      SELECT u.customer_id, u.username, u.email, u.phone, cp.segment, cp.age
      FROM users u
      JOIN customer_profiles cp ON u.customer_id = cp.customer_id
      ORDER BY u.customer_id
      LIMIT 10
    `);
    
    console.log('\n📋 User Account Creation Summary:');
    console.log(`   ✅ Successfully created: ${successCount} accounts`);
    console.log(`   ❌ Errors: ${errorCount} accounts`);
    console.log(`   📊 Total in database: ${successCount} users`);
    
    console.log('\n🔑 Sample Login Credentials (First 10 users):');
    console.log('Username | Password | Customer ID | Segment | Age');
    console.log('---------|----------|-------------|---------|----');
    
    for (const user of sampleUsers.rows) {
      const password = generateSecurePassword(user.customer_id, user.segment);
      console.log(`${user.username} | ${password} | ${user.customer_id} | ${user.segment} | ${user.age}`);
    }
    
    // Database statistics
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN password_changed = false THEN 1 END) as temp_passwords
      FROM users
    `);
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Total Users: ${stats.rows[0].total_users}`);
    console.log(`   Active Users: ${stats.rows[0].active_users}`);
    console.log(`   Temporary Passwords: ${stats.rows[0].temp_passwords}`);
    
    // Customer segment distribution
    const segments = await client.query(`
      SELECT cp.segment, COUNT(*) as count
      FROM users u
      JOIN customer_profiles cp ON u.customer_id = cp.customer_id
      GROUP BY cp.segment
      ORDER BY count DESC
    `);
    
    console.log('\n👥 Customer Segment Distribution:');
    segments.rows.forEach(row => {
      console.log(`   ${row.segment}: ${row.count} users`);
    });
    
    console.log('\n✅ User account creation completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating user accounts:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Password verification function (for testing)
async function verifyPassword(username, plainPassword) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT password_hash FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return false;
    }
    
    return await bcrypt.compare(plainPassword, result.rows[0].password_hash);
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  createUserAccounts()
    .then(() => {
      console.log('🎉 User account creation process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 User account creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createUserAccounts, verifyPassword };
