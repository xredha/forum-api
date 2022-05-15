const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const ToggleLike = require('../../../Domains/likes/entities/ToggleLike');

describe('LikeRepositoryPostgres', () => {
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
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('checkCommentIsLiked', () => {
    it('should return true when comment is liked', async () => {
      await LikesTableTestHelper.likeComment({ comment: commentId, owner: userId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const result = await likeRepositoryPostgres
        .checkCommentIsLiked({ comment: commentId, owner: userId });

      expect(result).toBe(true);
    });

    it('should return false when comment is not liked', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const result = await likeRepositoryPostgres
        .checkCommentIsLiked({ comment: commentId, owner: userId });

      expect(result).toBe(false);
    });
  });

  describe('likeComment', () => {
    it('should persist like comment', async () => {
      const like = new ToggleLike({
        comment: commentId,
        owner: userId,
      });
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const result = await likeRepositoryPostgres.likeComment(like);

      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual('likes-123');
    });
  });

  describe('unlikeComment', () => {
    it('should persist unlike comment', async () => {
      await LikesTableTestHelper.likeComment({ id: 'likes-123', comment: commentId, owner: userId });
      const like = new ToggleLike({
        comment: commentId,
        owner: userId,
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      await likeRepositoryPostgres.unlikeComment(like);
      const result = await LikesTableTestHelper.getLikedCommentByLikeId('likes-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('getLikeCountByCommentId', () => {
    it('should run getLikeCountByCommentId correctly', async () => {
      // add 3 user
      await UsersTableTestHelper.addUser({ id: 'user-111', username: 'dummy-1' });
      await UsersTableTestHelper.addUser({ id: 'user-222', username: 'dummy-2' });
      await UsersTableTestHelper.addUser({ id: 'user-333', username: 'dummy-3' });
      // add 3 likes
      await LikesTableTestHelper.likeComment({ id: 'likes-111', comment: commentId, owner: 'user-111' });
      await LikesTableTestHelper.likeComment({ id: 'likes-222', comment: commentId, owner: 'user-222' });
      await LikesTableTestHelper.likeComment({ id: 'likes-333', comment: commentId, owner: 'user-333' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const result = await likeRepositoryPostgres.getLikeCountByCommentId(commentId);

      expect(result).toEqual(3);
    });
  });
});
