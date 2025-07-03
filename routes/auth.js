const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER user
router.post('/register', async (req, res) => {
    const { username, password, first_name, last_name, city, state, preferred_language, role_id, date_of_birth } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const roleResult = await pool.query(`SELECT id FROM roles WHERE name = 'ROLE_USER' LIMIT 1`);
      if (roleResult.rows.length === 0) {
        return res.status(500).json({ error: 'Default role not found' });
      }
      const roleId = roleResult.rows[0].id;
      const result = await pool.query(
        `INSERT INTO users (id, username, password_hash, role_id, first_name, last_name, city, state, preferred_language, date_of_birth)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, username, first_name, last_name, city, state, preferred_language, date_of_birth, role_id`,
        [username, passwordHash, roleId, first_name, last_name, city, state, preferred_language, date_of_birth]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  });
  
  // LOGIN user
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
      const userResult = await pool.query(
        'SELECT id, username, password_hash, role_id FROM users WHERE username = $1',
        [username]
      );
      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'We couldn’t find an account with that username.' });
      }
      const user = userResult.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Your password is incorrect — double check and try again.' });
      }
      const token = jwt.sign({ userId: user.id, username: user.username, roleId: user.role_id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/me', authMiddleware, async (req, res) => {
    try {
        const id = req.user.userId;
        const result = await pool.query('SELECT id, first_name, last_name, created_date, last_modified_date, date_of_birth, city, state, preferred_language, role_id, username FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
  })

module.exports = router;