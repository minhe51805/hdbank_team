// Test PostgreSQL Connection
const pool = require('../config/database');

async function testConnection() {
  try {
    console.log('🔄 Testing PostgreSQL connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL');
    
    // Test database info
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);
    
    // Check current database
    const dbResult = await client.query('SELECT current_database()');
    console.log('💾 Current Database:', dbResult.rows[0].current_database);
    
    // List existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Existing Tables:');
    if (tablesResult.rows.length === 0) {
      console.log('   - No tables found (fresh database)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    client.release();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('🔧 Please check:');
    console.error('   - PostgreSQL container is running');
    console.error('   - Port 5435 is accessible');
    console.error('   - Credentials are correct');
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection();
