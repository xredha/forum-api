const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-123';

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: userId,
    });
    await ThreadsTableTestHelper.addThread({
      id: threadId,
      owner: userId,
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('AddComment function', () => {
    it('should persist add comment', async () => {
      const addComment = new AddComment({
        content: 'Test Content Comment',
        thread: threadId,
        owner: userId,
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await commentRepositoryPostgres.addComment(addComment);

      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const addComment = new AddComment({
        content: 'Test Content Comment',
        thread: threadId,
        owner: userId,
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedComment = await commentRepositoryPostgres.addComment(
        addComment,
      );

      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'Test Content Comment',
          owner: userId,
        }),
      );
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError when comment is not your owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      return expect(commentRepositoryPostgres.verifyCommentOwner('comment-999', userId))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment is your owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userId,
      });

      await expect(commentRepositoryPostgres.verifyCommentOwner(comment.id, userId))
        .resolves
        .not
        .toThrowError(AuthorizationError);
    });
  });

  describe('checkCommentIfExists', () => {
    it('should throw NotFoundError when comment is not exists', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      return expect(commentRepositoryPostgres.checkCommentIfExists('comment-999'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment is exists but comment is deleted', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userId,
        isDelete: true,
      });

      return expect(commentRepositoryPostgres.checkCommentIfExists(comment.id))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment is exists and not deleted', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userId,
      });

      return expect(commentRepositoryPostgres.checkCommentIfExists(comment.id))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('deleteComment', () => {
    it('should run function deleteComment correctly and return id, delete status', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comment = await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userId,
      });

      const result = await commentRepositoryPostgres.deleteComment(comment.id);

      expect(result.booldelete).toEqual(true);
      expect(result.id).toEqual(comment.id);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should run function getCommentsByThreadId correctly and return empty comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const getCommentsByThreadId = await commentRepositoryPostgres.getCommentsByThreadId('undefined');

      expect(getCommentsByThreadId).toEqual([]);
    });

    it('should run function getCommentsByThreadId correctly and return many comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        thread: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        thread: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-345',
        thread: threadId,
        owner: userId,
      });

      const getCommentsByThreadId = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      expect(getCommentsByThreadId).toHaveLength(3);
    });
  });
});
