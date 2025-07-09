const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const { getPostWithLikes } = require('../services/postService');


router.get('/', authMiddleware, async (req, res) => {
    const username = req.user.username;
    try {
      const postsResult = await pool.query(`
        SELECT p.*, 
              u.id AS user_id, u.username, u.first_name, u.last_name, 
              u.city, u.state, u.preferred_language, u.date_of_birth, u.role_id
        FROM posts p
        JOIN users u ON p.author = u.id
      `);
      const likesResult = await pool.query('SELECT post_id, username FROM likes');

      const likesMap = likesResult.rows.reduce((acc, { post_id, username }) => {
        if(!acc[post_id]) acc[post_id] = [];
        acc[post_id].push(username);
        return acc;
      }, {});

      const commentsResult = await pool.query(`
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
      `);

      const commentCountMap = commentsResult.rows.reduce((acc, { post_id, comment_count }) => {
        acc[post_id] = parseInt(comment_count, 10);
        return acc;
      }, {});

      const postsWithLikes = postsResult.rows.map((post) => ({
        id: post.id,
        title: post.title,
        text: post.text,
        created_date: post.created_date,
        last_modified_date: post.last_modified_date,
        likes: likesMap[post.id] || [],
        likedByMe: likesMap[post.id]?.includes(username) || false,
        comments_count: commentCountMap[post.id] || 0,
        author: {
          id: post.user_id,
          username: post.username,
          first_name: post.first_name,
          last_name: post.last_name,
          city: post.city,
          state: post.state,
          preferred_language: post.preferred_language,
          date_of_birth: post.date_of_birth,
          role_id: post.role_id
        }
      }));

      res.json(postsWithLikes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

router.get('/my', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const userResult = await pool.query(`
      SELECT id, username, first_name, last_name, city, state, preferred_language, date_of_birth, role_id
      FROM users
      WHERE id = $1
    `, [userId]);

    const author = userResult.rows[0];

    const postsResult = await pool.query('SELECT * FROM posts WHERE author = $1', [userId]);
    if (postsResult.rows.length === 0) return res.status(404).json({ error: 'There are no posts created by the specifed user' });

    const likesResult = await pool.query('SELECT post_id, username FROM likes');

    const likesMap = likesResult.rows.reduce((acc, { post_id, username }) => {
      if(!acc[post_id]) acc[post_id] = [];
      acc[post_id].push(username);
      return acc;
    }, {});

    const commentsResult = await pool.query(`
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    `);

    const commentCountMap = commentsResult.rows.reduce((acc, { post_id, comment_count }) => {
      acc[post_id] = parseInt(comment_count, 10);
      return acc;
    }, {});


    const postsWithLikes = postsResult.rows.map((post) => ({
      ...post,
      likes: likesMap[post.id] || [],
      likedByMe: likesMap[post.id]?.includes(author.username) || false,
      comments_count: commentCountMap[post.id] || 0,
      author: author
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
      text,
      title,
      tags,
      tags_count
    } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO posts (
          id, author, text, title, tags, tags_count, created_date, last_modified_date
        ) VALUES (
          uuid_generate_v4(), $1, $2, $3, $4, $5, NOW(), NOW()
        ) RETURNING *`,
        [author, text, title, tags, tags_count]
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


router.post('/:id/comments', authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const created_by = req.user.userId;
  const { content, reply_id, username_to_reply } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO comments
      (id, post_id, created_by, reply_id, username_to_reply, content, created_date, last_modified_date)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [postId, created_by, reply_id, username_to_reply, content]);

    const comment = result.rows[0];

    const userResult = await pool.query(`
      SELECT id, username, first_name, last_name, city, state,
             preferred_language, date_of_birth, role_id
      FROM users
      WHERE id = $1
    `, [comment.created_by]);

    const user = userResult.rows[0];

    const enrichedComment = {
      ...comment,
      created_by: user
    };

    res.status(201).json(enrichedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id/comments/all', authMiddleware, async (req, res) => {
  const postId = req.params.id;

  try {
    const commentResults = await pool.query(`
      SELECT c.*, 
             u.id AS user_id, u.username, u.first_name, u.last_name,
             u.city, u.state, u.preferred_language, u.date_of_birth, u.role_id
      FROM comments c
      JOIN users u ON c.created_by = u.id
      WHERE c.post_id = $1
    `, [postId]);

    if (commentResults.rowCount === 0) {
      return res.status(404).json({ message: 'There are no comments for this post yet' });
    }

    const enrichedComments = commentResults.rows.map(comment => ({
      id: comment.id,
      post_id: comment.post_id,
      reply_id: comment.reply_id,
      username_to_reply: comment.username_to_reply,
      content: comment.content,
      created_date: comment.created_date,
      last_modified_date: comment.last_modified_date,
      banned: comment.banned,
      created_by: {
        id: comment.user_id,
        username: comment.username,
        first_name: comment.first_name,
        last_name: comment.last_name,
        city: comment.city,
        state: comment.state,
        preferred_language: comment.preferred_language,
        date_of_birth: comment.date_of_birth,
        role_id: comment.role_id
      }
    }));

    res.status(200).json(enrichedComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;