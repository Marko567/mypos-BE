const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

  
  // READ all users
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, first_name, last_name, created_date, last_modified_date, date_of_birth, city, state, preferred_language, role_id, username FROM users');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // READ single user
  router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT id, first_name, last_name, created_date, last_modified_date, date_of_birth, city, state, preferred_language, role_id, username FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // UPDATE user
  router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
      const result = await pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // DELETE user
  router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User deleted', user: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;