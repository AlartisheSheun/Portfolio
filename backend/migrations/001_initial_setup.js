
const up = [
    `CREATE TABLE IF NOT EXISTS mysql_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp varchar(254) NOT NULL UNIQUE,
        name varchar(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX email_index (email)
    )`
];

const down = [
    'DROP TABLE IF EXISTS messages',
    'DROP TABLE IF EXISTS mysql_migrations'
];

module.exports = { up, down };