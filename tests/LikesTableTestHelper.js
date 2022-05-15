/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async likeComment({ id = 'likes-123', comment, owner }) {
    const query = {
      text: 'INSERT INTO likes(id, comment_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, comment, owner],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async getLikedCommentByLikeId(id) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getAllLikes() {
    const query = {
      text: 'SELECT * FROM likes',
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
