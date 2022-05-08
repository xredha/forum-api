const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: userId,
    });
    await ThreadsTableTestHelper.addThread({
      id: threadId,
      owner: userId,
    });
    await CommentsTableTestHelper.addComment({
      id: commentId,
      thread: threadId,
      owner: userId,
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      const addReply = new AddReply({
        content: 'Test Content Reply',
        comment: commentId,
        owner: userId,
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await replyRepositoryPostgres.addReply(addReply);

      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const addReply = new AddReply({
        content: 'Test Content Reply',
        comment: commentId,
        owner: userId,
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'Test Content Reply',
          owner: userId,
        })
      );
    });
  });

  describe('getRepliesByThreadId', () => {
    it('should run function getRepliesByThreadId correctly and return 6 objects (id, content, date, username, commentid, booldelete)', async () => {
      await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const getReply = await replyRepositoryPostgres.getRepliesByThreadId(
        threadId
      );

      expect(getReply[0]).toHaveProperty('id');
      expect(getReply[0]).toHaveProperty('content');
      expect(getReply[0]).toHaveProperty('date');
      expect(getReply[0]).toHaveProperty('username');
      expect(getReply[0]).toHaveProperty('commentid');
      expect(getReply[0]).toHaveProperty('booldelete');
    });
  });
});
