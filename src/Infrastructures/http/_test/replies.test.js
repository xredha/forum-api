const pool = require('../../database/postgres/pool');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoint', () => {
  let server;
  let accessToken;
  let threadPayload;
  let commentPayload;
  const user = {
    username: 'galih',
    password: 'rahasia',
    fullname: 'galih redha'
  };
  const thread = {
    title: 'Test Title Thread',
    body: 'Test Body Thread'
  }
  const comment = {
    content: 'Test Content Comment'
  }

  beforeEach(async () => {
    server = await createServer(container);

    // Make User
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: user
    })

    // Login
    const authentications = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: user.username,
        password: user.password
      }
    })
    accessToken = JSON.parse(authentications.payload).data.accessToken;

    // Make Thread
    const threads = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: thread,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    threadPayload = JSON.parse(threads.payload).data.addedThread;

    // Make Comment
    const comments = await server.inject({
      method: 'POST',
      url: `/threads/${threadPayload.id}/comments`,
      payload: comment,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    commentPayload = JSON.parse(comments.payload).data.addedComment;
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when /POST replies', () => {
    it('should response 201 and persisted replies', async () => {
      const requestPayload = {
        content: 'Test Content Replies',
      };
      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseReplies.payload);
      expect(responseReplies.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 401 when before request didnt login (not authorization)', async () => {
      const requestPayload = {
        content: 'Test Content Replies',
      };
      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer undefined`,
        },
      });

      expect(responseReplies.statusCode).toEqual(401);
    });

    it('should response 404 when reply on nothing thread', async () => {
      const requestPayload = {
        content: 'Test Content Replies',
      };
      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/undefined/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseReplies.payload);
      expect(responseReplies.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('data thread tidak ditemukan');
    });

    it('should response 404 when reply on nothing comment', async () => {
      const requestPayload = {
        content: 'Test Content Replies',
      };
      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/undefined/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseReplies.payload);
      expect(responseReplies.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('data komentar tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        undefined: 'Test Content Replies',
      };
      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseReplies.payload);
      expect(responseReplies.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: [],
      };
      const responseReplies = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments/${commentPayload.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseReplies.payload);
      expect(responseReplies.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply baru karena tipe data tidak sesuai'
      );
    });
  });
})