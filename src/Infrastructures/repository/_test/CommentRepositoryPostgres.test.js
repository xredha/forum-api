const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

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
      const user = await UsersTableTestHelper.findUsersById(userId);
      const thread = await ThreadsTableTestHelper.findThreadsById(threadId);
      const addComment = new AddComment({
        content: 'Test Content Comment',
        thread: thread[0].id,
        owner: user[0].id,
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepositoryPostgres.addComment(addComment);

      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123'
      );
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const user = await UsersTableTestHelper.findUsersById(userId);
      const thread = await ThreadsTableTestHelper.findThreadsById(threadId);
      const addComment = new AddComment({
        content: 'Test Content Comment',
        thread: thread[0].id,
        owner: user[0].id,
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedComment = await commentRepositoryPostgres.addComment(
        addComment
      );

      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'Test Content Comment',
          owner: user[0].id,
        })
      );
    });
  });
});
