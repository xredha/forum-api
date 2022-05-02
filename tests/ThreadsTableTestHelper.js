/* istanbul ignore file */
const pool = require('./../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async addThread({
    id = 'thread-123',
    title = 'title 123',
    body = 'body 123',
    owner,
  }) {
    const query = {
      text: 'INSERT INTO threads(id, title, body, user_id) VALUES($1, $2, $3, $4) RETURNING id, title, user_id AS owner',
      values: [id, title, body, owner],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
