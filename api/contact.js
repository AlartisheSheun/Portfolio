const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').end('Method Not Allowed');
    return;
  }

  try {
    const { fullName, email, phone, subject, message } = req.body || {};
    if (!fullName || !email || !message) {
      res.status(400).json({ error: 'Required fields missing' });
      return;
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      ssl: process.env.DB_CA_CERT
        ? { ca: Buffer.from(process.env.DB_CA_CERT, 'base64').toString('ascii') }
        : undefined,
    });

    const [result] = await connection.execute(
      `INSERT INTO messages (full_name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [fullName, email, phone, subject, message]
    );

    await connection.end();

    res.status(200).json({ success: true, messageId: result.insertId });
  } catch (err) {
    console.error('API contact error:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
};
