const pool = require('../db/pool');

async function createComment({ postId, userId, content, replyId, usernameToReply }) {
  const result = await pool.query(`
    INSERT INTO comments
    (id, post_id, created_by, reply_id, username_to_reply, content, created_date, last_modified_date)
    VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *
  `, [postId, userId, replyId, usernameToReply, content]);

  const comment = result.rows[0];

  const userResult = await pool.query(`
    SELECT id, username, first_name, last_name, city, state,
           preferred_language, date_of_birth, role_id
    FROM users
    WHERE id = $1
  `, [comment.created_by]);

  const user = userResult.rows[0];

  return {
    ...comment,
    created_by: user
  };
}

async function getCommentsForPost(postId) {
  const commentResults = await pool.query(`
    SELECT c.*, 
           u.id AS user_id, u.username, u.first_name, u.last_name,
           u.city, u.state, u.preferred_language, u.date_of_birth, u.role_id
    FROM comments c
    JOIN users u ON c.created_by = u.id
    WHERE c.post_id = $1
  `, [postId]);

  if (commentResults.rowCount === 0) {
    return [];
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

  return enrichedComments;
}

async function getCommentCountsForPosts() {
  const result = await pool.query(`
    SELECT post_id, COUNT(*) AS comment_count
    FROM comments
    GROUP BY post_id
  `);

  return result.rows.reduce((acc, { post_id, comment_count }) => {
    acc[post_id] = parseInt(comment_count, 10);
    return acc;
  }, {});
}

module.exports = {
  createComment,
  getCommentsForPost,
  getCommentCountsForPosts
};
