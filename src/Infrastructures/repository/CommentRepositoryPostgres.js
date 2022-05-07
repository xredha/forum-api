const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { content, thread, owner } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments(id, content, thread_id, user_id) VALUES($1, $2, $3, $4) RETURNING id, content, user_id AS owner',
      values: [id, content, thread, owner],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentOwner(id, userId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND user_id = $2',
      values: [id, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('komentar ini bukan milik anda');
    }

    return result.rows[0];
  }

  async checkCommentIfExists(id) {
    const query = {
      text: 'SELECT id, is_delete AS booldelete FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount || result.rows[0].booldelete) {
      throw new NotFoundError('data komentar tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2 RETURNING id, is_delete AS booldelete',
      values: [true, id],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, username, date, content, is_delete AS booldelete
              FROM comments
              JOIN users
              ON comments.user_id = users.id
              WHERE comments.thread_id = $1
              ORDER BY date`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
