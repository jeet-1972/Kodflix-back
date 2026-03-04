const { pool } = require('../config/db');

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findUserByEmailOrUsername(identifier) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
    [identifier, identifier],
  );
  return rows[0] || null;
}

async function createUser({ username, email, phone, passwordHash, role = 'user' }) {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [username, email, phone, passwordHash, role],
  );

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  return rows[0] || null;
}

module.exports = {
  findUserByEmail,
  findUserByEmailOrUsername,
  createUser,
};

