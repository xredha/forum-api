const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    const { content, comment, owner } = reply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, user_id) VALUES($1, $2, $3, $4) RETURNING id, content, user_id AS owner',
      values: [id, content, comment, owner],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.date, username, replies.comment_id AS commentid, replies.is_delete AS booldelete
              FROM replies
              JOIN users ON replies.user_id = users.id
              JOIN comments ON replies.comment_id = comments.id
              JOIN threads ON threads.id = comments.thread_id
              WHERE threads.id = $1
              ORDER BY replies.date`,
      values: [threadId]
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
