const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const { getPostWithLikes } = require('../services/postService');


router.get('/', authMiddleware, async (req, res) => {
    const username = req.user.username;
    try {
      const postsResult = await pool.query('SELECT * FROM posts');
      const likesResult = await pool.query('SELECT post_id, username FROM likes');

      const likesMap = likesResult.rows.reduce((acc, { post_id, username }) => {
        if(!acc[post_id]) acc[post_id] = [];
        acc[post_id].push(username);
        return acc;
      }, {});

      const postsWithLikes = postsResult.rows.map((post) => ({
        ...post,
        likes: likesMap[post.id] || [],
        likedByMe: likesMap[post.id] ? likesMap[post.id].includes(username) : false
      }))

      res.json(postsWithLikes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

router.get('/my', authMiddleware, async (req, res) => {
  const username = req.user.username;
  try {
    const postsResult = await pool.query('SELECT * FROM posts WHERE author = $1', [username]);
    if (postsResult.rows.length === 0) return res.status(404).json({ error: 'There are no posts created by the specifed user' });

    const likesResult = await pool.query('SELECT post_id, username FROM likes WHERE username=$1', [username]);

    const likesMap = likesResult.rows.reduce((acc, { post_id, username }) => {
      if(!acc[post_id]) acc[post_id] = [];
      acc[post_id].push(username);
      return acc;
    }, {});


    const postsWithLikes = postsResult.rows.map((post) => ({
      ...post,
      likes: likesMap[post.id] || [],
      likedByMe: likesMap[post.id] ? likesMap[post.id].includes(username) : false
    }));
    
    res.json(postsWithLikes);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
})

// CREATE a new post
router.post('/', authMiddleware, async (req, res) => {
    const {
      author,
      comments_count,
      text,
      title,
      likes_count,
      tags,
      tags_count
    } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO posts (
          id, author, comments_count, text, title, likes_count, tags, tags_count, created_date, last_modified_date
        ) VALUES (
          uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        ) RETURNING *`,
        [author, comments_count, text, title, likes_count, tags, tags_count]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const username = req.user.username;
  try {
    const post = await getPostWithLikes(id, username);
    if(!post) return res.status(404).json({ error: 'Post not found' });

    res.status(200).json(post);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
})

router.post('/:id/like', authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const username = req.user.username;

  try {
    await pool.query(
      `INSERT INTO likes (post_id, username)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`, 
      [postId, username]
    );

    const post = await getPostWithLikes(postId, username);
    if(!post) return res.status(404).json({ error: 'Post not found' });
    
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id/like', authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const username = req.user.username;

  try { 
    const result = await pool.query('DELETE FROM likes WHERE post_id=$1 AND username=$2', [postId, username]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Like not found or already removed' });
    }

    const post = await getPostWithLikes(postId, username);
    if(!post) return res.status(404).json({ error: 'Post not found' });

    res.status(200).json(post);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
})

module.exports = router;