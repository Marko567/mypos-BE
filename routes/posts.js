const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');


router.get('/', authMiddleware, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM posts');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const username = req.user.username;
    
    const result = await pool.query('SELECT * FROM posts WHERE author = $1', [username]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'There are no posts created by the specifed user' });
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
})

// CREATE a new post
router.post('/', authMiddleware, async (req, res) => {
    const {
      author,
      commentsCount,
      text,
      title,
      likesCount,
      tags,
      tagsCount
    } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO posts (
          id, author, comments_count, text, title, likes_count, tags, tags_count, created_date, last_modified_date
        ) VALUES (
          uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        ) RETURNING *`,
        [author, commentsCount, text, title, likesCount, tags, tagsCount]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;