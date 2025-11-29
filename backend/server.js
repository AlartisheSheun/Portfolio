const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool for Aiven MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false,
        ca: process.env.DB_CA_CERT ? Buffer.from(process.env.DB_CA_CERT, 'base64').toString('ascii') : undefined
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Create messages table if it doesn't exist (optional, since migrations handle this)
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;
db.query(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating table:', err);
        return;
    }
    console.log('Messages table ready');
});

// API endpoint to handle contact form submissions
app.post('/api/contact', (req, res) => {
    const { fullName, email, phone, subject, message } = req.body;

    // Validate inputs
    if (!fullName || !email || !message) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    const query = `
        INSERT INTO messages (full_name, email, phone, subject, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [fullName, email, phone, subject, message], (err, result) => {
        if (err) {
            console.error('Error saving message:', err);
            return res.status(500).json({ error: 'Failed to save message' });
        }
        res.json({ success: true, messageId: result.insertId });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});