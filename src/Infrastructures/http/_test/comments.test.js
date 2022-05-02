const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  let server;
  let accessToken;
  let threadPayload;
  const user = {
    username: 'galih',
    password: 'rahasia',
    fullname: 'galih redha'
  };
  const thread = {
    title: 'Test Title Thread',
    body: 'Test Body Thread'
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
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when /POST comments', () => {
    it('should response 201 and persisted comments', async () => {
      const requestPayload = {
        content: 'Test Content Comment',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseComments.payload);
      expect(responseComments.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 401 when before request didnt login (not authorization)', async () => {
      const requestPayload = {
        content: 'Test Content Comment',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer undefined`,
        },
      });

      expect(responseComments.statusCode).toEqual(401);
    });

    it('should response 404 when comment on nothing thread', async () => {
      const requestPayload = {
        content: 'Test Content Comment',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/undefined/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseComments.payload);
      expect(responseComments.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('data thread tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        undefined: 'hello world',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseComments.payload);
      expect(responseComments.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: [],
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseComments.payload);
      expect(responseComments.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena tipe data tidak sesuai'
      );
    });
  });

  describe('when /DELETE comments', () => {
    it('should response 200 and success', async () => {
      const requestPayload = {
        content: 'Test Content Comment',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const dataComment = JSON.parse(responseComments.payload).data.addedComment;

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${dataComment.id}`,
        payload: {
          id: dataComment.id,
          thread: threadPayload.id
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const deleteComment = JSON.parse(responseDeleteComment.payload);
      expect(responseDeleteComment.statusCode).toEqual(200);
      expect(deleteComment.status).toEqual('success');
    });

    it('should response 401 when before request didnt login (not authorization)', async () => {
      const requestPayload = {
        content: 'Test Content Comment',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const dataComment = JSON.parse(responseComments.payload).data.addedComment;

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${dataComment.id}`,
        payload: {
          id: dataComment.id,
          thread: threadPayload.id
        },
        headers: {
          Authorization: `Bearer undefined`,
        },
      })

      expect(responseDeleteComment.statusCode).toEqual(401);
    });

    it('should reponse 403 when comment didnt delete by the comment owner', async () => {
      const requestPayload = {
        content: 'Test Content Comment',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const dataComment = JSON.parse(responseComments.payload).data.addedComment;

      // Login Another User
      const dummyUser = {
        username: 'dummy',
        password: 'dummy123',
        fullname: 'dummy dummy'
      }
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: dummyUser
      })
      const authentications = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: dummyUser.username,
          password: dummyUser.password
        }
      })
      const dummyAccesstoken = JSON.parse(authentications.payload).data.accessToken;

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/${dataComment.id}`,
        payload: {
          id: dataComment.id,
          thread: threadPayload.id
        },
        headers: {
          Authorization: `Bearer ${dummyAccesstoken}`,
        },
      })

      const deleteComment = JSON.parse(responseDeleteComment.payload);
      expect(responseDeleteComment.statusCode).toEqual(403);
      expect(deleteComment.status).toEqual('fail');
      expect(deleteComment.message).toEqual('komentar ini bukan milik anda');
    })

    it('should response 404 when thread not found', async () => {
      const requestPayload = {
        content: 'Test Content Comment',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const dataComment = JSON.parse(responseComments.payload).data.addedComment;

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/undefined/comments/${dataComment.id}`,
        payload: {
          id: dataComment.id,
          thread: threadPayload.id
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const deleteComment = JSON.parse(responseDeleteComment.payload);
      expect(responseDeleteComment.statusCode).toEqual(404);
      expect(deleteComment.status).toEqual('fail');
      expect(deleteComment.message).toEqual('data thread tidak ditemukan');
    })
    
    it('should response 404 when comment not found', async () => {
      const requestPayload = {
        content: 'Test Content Comment',
      };
      const responseComments = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const dataComment = JSON.parse(responseComments.payload).data.addedComment;

      const responseDeleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadPayload.id}/comments/undefined`,
        payload: {
          id: dataComment.id,
          thread: threadPayload.id
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const deleteComment = JSON.parse(responseDeleteComment.payload);
      expect(responseDeleteComment.statusCode).toEqual(404);
      expect(deleteComment.status).toEqual('fail');
      expect(deleteComment.message).toEqual('data komentar tidak ditemukan');
    })
  })
});
