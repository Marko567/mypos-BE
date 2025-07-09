const pool = require('../db/pool');

async function getPostWithLikes(postId, currentUsername) {
  const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
  if (postResult.rowCount === 0) return null;

  const post = postResult.rows[0];

  const authorResult = await pool.query(`
    SELECT id, username, first_name, last_name, city, state,
           preferred_language, date_of_birth, role_id
    FROM users
    WHERE id = $1
  `, [post.author]);
  
  const author = authorResult.rows[0];

  const likesResult = await pool.query('SELECT username FROM likes WHERE post_id = $1', [postId]);
  const likes = likesResult.rowCount ? likesResult.rows.map(row => row.username) : [];
  const likedByMe = likes.includes(currentUsername);

  const commentsResult = await pool.query(`
    SELECT COUNT(*) AS comment_count
    FROM comments
    WHERE post_id = $1
  `, [postId]);

  const comments_count = parseInt(commentsResult.rows[0].comment_count, 10);

  return { ...postResult.rows[0], likes, likedByMe, comments_count, author };
}

module.exports = {
  getPostWithLikes
};
