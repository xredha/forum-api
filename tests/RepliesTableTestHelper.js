/* istanbul ignore file */
const pool = require('./../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'test content reply',
    comment,
    owner,
    isDelete = false
  }) {
    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, user_id, is_delete) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, content, comment, owner, isDelete],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
