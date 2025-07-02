const pool = require('../db/pool');

async function getPostWithLikes(postId, currentUsername) {
  const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
  if (postResult.rowCount === 0) return null;

  const likesResult = await pool.query('SELECT username FROM likes WHERE post_id = $1', [postId]);
  const likes = likesResult.rowCount ? likesResult.rows.map(row => row.username) : [];
  const likedByMe = likes.includes(currentUsername);

  return { ...postResult.rows[0], likes, likedByMe };
}

module.exports = {
  getPostWithLikes
};
