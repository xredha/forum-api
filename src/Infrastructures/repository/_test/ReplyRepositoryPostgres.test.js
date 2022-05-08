const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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

  describe('verifyReplyOwner', () => {
    it('should throw AuthorizationError when reply is not your owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      return expect(replyRepositoryPostgres.verifyReplyOwner('reply-999', userId))
        .rejects
        .toThrowError(AuthorizationError);
    })

    it('should not throw AuthorizationError when reply is your owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userId
      });

      await expect(replyRepositoryPostgres.verifyReplyOwner(reply.id, userId))
        .resolves
        .not
        .toThrowError(AuthorizationError);
    });
  })

  describe('checkReplyIsExists', () => {
    it('should throw NotFoundError when reply is not exists', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      return expect(replyRepositoryPostgres.checkReplyIfExists('reply-999'))
        .rejects
        .toThrowError(NotFoundError);
    })

    it('should throw NotFoundError when reply is exists but reply is deleted', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userId,
        isDelete: true
      });

      return expect(replyRepositoryPostgres.checkReplyIfExists(reply.id))
        .rejects
        .toThrowError(NotFoundError);
    })

    it('should not throw NotFoundError when reply is exists and not deleted', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userId
      });

      return expect(replyRepositoryPostgres.checkReplyIfExists(reply.id))
        .resolves
        .not
        .toThrowError(NotFoundError);
    })
  })

  describe('deleteReply', () => {
    it('should run function deleteReply correctly and return id, delete status', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const reply = await RepliesTableTestHelper.addReply({
        comment: commentId,
        owner: userId
      });

      const result = await replyRepositoryPostgres.deleteReply(reply.id);

      expect(result.booldelete).toEqual(true);
      expect(result.id).toEqual(reply.id);
    });
  })
});
