// Fix database tables - Remove foreign key constraints temporarily
const pool = require('../config/database');

async function fixTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Removing foreign key constraints temporarily...');
    
    await client.query('BEGIN');
    
    // Drop existing foreign key constraints
    await client.query(`
      ALTER TABLE customer_profiles 
      DROP CONSTRAINT IF EXISTS fk_customer_profiles_customer_id;
    `);
    
    await client.query(`
      ALTER TABLE customer_labels 
      DROP CONSTRAINT IF EXISTS fk_customer_labels_customer_id;
    `);
    
    await client.query(`
      ALTER TABLE customer_propensity 
      DROP CONSTRAINT IF EXISTS fk_customer_propensity_customer_id;
    `);
    
    console.log('✅ Foreign key constraints removed');
    
    await client.query('COMMIT');
    
    console.log('🎉 Database tables fixed! Ready for data migration.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  fixTables()
    .then(() => {
      console.log('✅ Table fix completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Table fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixTables;
