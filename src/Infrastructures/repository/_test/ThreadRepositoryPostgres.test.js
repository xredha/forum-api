const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  const userIdCredentials = 'user-123';

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: userIdCredentials,
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      const user = await UsersTableTestHelper.findUsersById(userIdCredentials);
      const addThread = new AddThread({
        title: 'Test Title Thread',
        body: 'Test Body Thread',
        owner: user[0].id,
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await threadRepositoryPostgres.addThread(addThread);

      const threads = await ThreadsTableTestHelper.findThreadsById(
        'thread-123'
      );
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const user = await UsersTableTestHelper.findUsersById(userIdCredentials);
      const addThread = new AddThread({
        title: 'Test Title Thread',
        body: 'Test Body Thread',
        owner: user[0].id,
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Test Title Thread',
          owner: userIdCredentials,
        })
      );
    });
  });

  describe('checkThreadIfExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.checkThreadIfExists('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return id when thread is found', async () => {
      const user = await UsersTableTestHelper.findUsersById(userIdCredentials);
      const thread = await ThreadsTableTestHelper.addThread({
        owner: user[0].id,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const checkThread = await threadRepositoryPostgres.checkThreadIfExists(
        thread.id
      );
      expect(checkThread.id).toEqual(thread.id);
    });
  });
});
