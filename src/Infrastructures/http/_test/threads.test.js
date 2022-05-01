const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  const user = {
    username: 'galih',
    password: 'rahasia',
    fullname: 'galih redha'
  }

  beforeEach(async () => {
    // Make User
    const server = await createServer(container);
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: user
    })
  })

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const server = await createServer(container);

      const authentications = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: user.username,
          password: user.password
        }
      })
      const responseAuthentications = JSON.parse(authentications.payload);
      const accessToken = responseAuthentications.data.accessToken;

      const requestPayload = {
        title: 'Test Title Thread',
        body: 'Test Body Thread'
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
      const server = await createServer(container);

      const requestPayload = {
        title: 'Test Title Thread',
        body: 'Test Body Thread'
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(responseThreads.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);

      const authentications = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: user.username,
          password: user.password
        }
      })
      const responseAuthentications = JSON.parse(authentications.payload);
      const accessToken = responseAuthentications.data.accessToken;

      const requestPayload = {
        title: 'Test Title Thread'
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
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const server = await createServer(container);

      const authentications = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: user.username,
          password: user.password
        }
      })
      const responseAuthentications = JSON.parse(authentications.payload);
      const accessToken = responseAuthentications.data.accessToken;

      const requestPayload = {
        title: [],
        body: {},
        owner: 123
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
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  })
})