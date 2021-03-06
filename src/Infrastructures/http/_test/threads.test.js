const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let server;
  let accessToken;
  const user = {
    username: 'galih',
    password: 'rahasia',
    fullname: 'galih redha',
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
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'Test Title Thread',
        body: 'Test Body Thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseThreads.payload);
      expect(responseThreads.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when before request didnt login (not authorization)', async () => {
      const requestPayload = {
        title: 'Test Title Thread',
        body: 'Test Body Thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: 'Bearer undefined',
        },
      });

      const responseJson = JSON.parse(responseThreads.payload);
      expect(responseJson.statusCode).toEqual(401);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        title: 'Test Title Thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseThreads.payload);
      expect(responseThreads.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        title: [],
        body: {},
        owner: 123,
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseThreads.payload);
      expect(responseThreads.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      );
    });
  });

  describe('when GET /threads', () => {
    it('should response 200 and persisted detail thread', async () => {
      // add 2 user
      await UsersTableTestHelper.addUser({
        id: 'user-222',
        username: 'userA',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-333',
        username: 'userB',
      });
      // add 1 thread user A
      const thread = await ThreadsTableTestHelper.addThread({
        owner: 'user-222',
      });
      // add 2 comments user B user A
      await CommentsTableTestHelper.addComment({
        id: 'comment-222',
        thread: thread.id,
        owner: 'user-222',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-333',
        thread: thread.id,
        owner: 'user-333',
      });
      // add 2 replies to comment-222
      await RepliesTableTestHelper.addReply({
        id: 'reply-222',
        comment: 'comment-222',
        owner: 'user-222',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-333',
        comment: 'comment-222',
        owner: 'user-333',
      });
      // add 2 likes to comment-222
      await LikesTableTestHelper.likeComment({
        id: 'like-111',
        comment: 'comment-222',
        owner: 'user-222',
      });
      await LikesTableTestHelper.likeComment({
        id: 'like-222',
        comment: 'comment-222',
        owner: 'user-333',
      });

      const responseThreads = await server.inject({
        method: 'GET',
        url: `/threads/${thread.id}`,
      });
      const responseJson = JSON.parse(responseThreads.payload);

      expect(responseThreads.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(2);
    });

    it('should response 404 when thread not found', async () => {
      const responseThreads = await server.inject({
        method: 'GET',
        url: '/threads/undefined',
      });

      const responseJson = JSON.parse(responseThreads.payload);
      expect(responseThreads.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('data thread tidak ditemukan');
    });
  });
});
