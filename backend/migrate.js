const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 12607,
    ssl: {
        rejectUnauthorized: false,
        ca: process.env.DB_CA_CERT ? Buffer.from(process.env.DB_CA_CERT, 'base64').toString('ascii') : undefined
    }
};

async function runMigrations() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('Connected to database successfully');
        
        // Get all migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files.filter(f => f.endsWith('.js')).sort();

        // Execute each migration
        for (const file of migrationFiles) {
            const migration = require(path.join(migrationsDir, file));
            const timestamp = file.split('_')[0];
            
            // Check if migration was already executed
            const [rows] = await connection.execute(
                'SELECT * FROM mysql_migrations WHERE timestamp = ? LIMIT 1',
                [timestamp]
            ).catch(() => [[]]);  // If table doesn't exist yet, return empty array

            if (rows.length === 0) {
                console.log(`Running migration: ${file}`);
                
                // Execute each migration statement
                if (Array.isArray(migration.up)) {
                    for (const stmt of migration.up) {
                        await connection.query(stmt);
                    }
                } else {
                    await connection.query(migration.up);
                }
                
                // Record the migration
                await connection.execute(
                    'INSERT INTO mysql_migrations (timestamp, name) VALUES (?, ?)',
                    [timestamp, file]
                ).catch(err => {
                    if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
                });
                
                console.log(`Completed migration: ${file}`);
            } else {
                console.log(`Skipping already executed migration: ${file}`);
            }
        }
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

// Run migrations
runMigrations().then(() => {
    console.log('Migration process completed');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});