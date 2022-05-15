const pool = require('../../database/postgres/pool');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/likes endpoint', () => {
  let server;
  let accessToken;
  let threadPayload;
  let commentPayload;
  const user = {
    username: 'galih',
    password: 'rahasia',
    fullname: 'galih redha',
  };
  const thread = {
    title: 'Test Title Thread',
    body: 'Test Body Thread',
  };
  const comment = {
    content: 'Test Content Comment',
  };

  beforeEach(async () => {
    server = await createServer(container);

    // Make User
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: user,
    });

    // Login
    const authentications = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: user.username,
        password: user.password,
      },
    });
    accessToken = JSON.parse(authentications.payload).data.accessToken;

    // Make Thread
    const threads = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: thread,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    threadPayload = JSON.parse(threads.payload).data.addedThread;

    // Make Comment
    const comments = await server.inject({
      method: 'POST',
      url: `/threads/${threadPayload.id}/comments`,
      payload: comment,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    commentPayload = JSON.parse(comments.payload).data.addedComment;
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when /PUT likes', () => {
    it('should response 200, success and like comment', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const putLikes = JSON.parse(responseLikes.payload);
      const allLikes = await LikesTableTestHelper.getAllLikes();

      expect(responseLikes.statusCode).toEqual(200);
      expect(putLikes.status).toEqual('success');
      expect(allLikes).toHaveLength(1);
    });

    it('should response 200, success and unlike comment', async () => {
      const userId = await UsersTableTestHelper.findUsersByUsername(user.username);
      await LikesTableTestHelper.likeComment({ comment: commentPayload.id, owner: userId.id });
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const putLikes = JSON.parse(responseLikes.payload);
      const allLikes = await LikesTableTestHelper.getAllLikes();

      expect(responseLikes.statusCode).toEqual(200);
      expect(putLikes.status).toEqual('success');
      expect(allLikes).toHaveLength(0);
    });

    it('should response 401 when before request didnt login (not authorization)', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/likes`,
        headers: {
          Authorization: 'Bearer undefined',
        },
      });

      expect(responseLikes.statusCode).toEqual(401);
    });

    it('should response 404 when thread not found', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/undefined/comments/${commentPayload.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const putLikes = JSON.parse(responseLikes.payload);
      expect(responseLikes.statusCode).toEqual(404);
      expect(putLikes.status).toEqual('fail');
      expect(putLikes.message).toEqual('data thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/undefined/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const putLikes = JSON.parse(responseLikes.payload);
      expect(responseLikes.statusCode).toEqual(404);
      expect(putLikes.status).toEqual('fail');
      expect(putLikes.message).toEqual('data komentar tidak ditemukan');
    });
  });

  describe('when /DELETE likes', () => {
    it('should return 200 when likes deleted', async () => {
      const responseLikes = await server.inject({
        method: 'PUT',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/likes/deleted`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const putLikes = JSON.parse(responseLikes.payload);
      expect(responseLikes.statusCode).toEqual(200);
      expect(putLikes.status).toEqual('success');
    });
  });
});
