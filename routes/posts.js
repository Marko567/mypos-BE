const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const { getPostWithLikes } = require('../services/postService');
const { createComment } = require('../services/commentService');
const { getCommentsForPost } = require('../services/commentService');
const { getCommentCountsForPosts } = require('../services/commentService');


router.get('/', authMiddleware, async (req, res) => {
    const username = req.user.username;
    try {
      const postsResult = await pool.query(`
        SELECT p.*, 
              u.id AS user_id, u.username, u.first_name, u.last_name, 
              u.city, u.state, u.preferred_language, u.date_of_birth, u.role_id
        FROM posts p
        JOIN users u ON p.author = u.id
        ORDER BY p.created_date DESC
      `);
      const likesResult = await pool.query('SELECT post_id, username FROM likes');

      const likesMap = likesResult.rows.reduce((acc, { post_id, username }) => {
        if(!acc[post_id]) acc[post_id] = [];
        acc[post_id].push(username);
        return acc;
      }, {});

      const commentCountMap = await getCommentCountsForPosts();

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

    const commentCountMap = await getCommentCountsForPosts();

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

// Add like to a post
// If the post is already liked by the user, it returns a 400 error
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

// DELETE a like from a post
// If the like does not exist, it returns a 404 error
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

// CREATE a new comment for a post
// The comment can be a reply to another comment
router.post('/:id/comments', authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;
  const { content, reply_id, username_to_reply } = req.body;

  try {
    const newComment = await createComment({
      postId,
      userId,
      content,
      replyId: reply_id,
      usernameToReply: username_to_reply
    });

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all comments for a post
// Returns an array of comments with user details
router.get('/:id/comments/all', authMiddleware, async (req, res) => {
  try {
    const comments = await getCommentsForPost(req.params.id);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'There are no comments for this post yet' });
    }
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;