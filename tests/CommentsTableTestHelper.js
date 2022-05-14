/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async addComment({
    id = 'comment-123',
    content = 'hello world',
    thread,
    owner,
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, thread_id, user_id, is_delete) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, content, thread, owner, isDelete],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
