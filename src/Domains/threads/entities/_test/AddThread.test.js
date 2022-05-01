const AddThread = require('../AddThread');

describe('AddThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'test title thread',
    };

    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: {},
      owner: [],
    };

    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create addThread object correctly', () => {
    const payload = {
      title: 'test title thread',
      body: 'test body thread',
      owner: 'user-123',
    };

    const addThread = new AddThread(payload);

    expect(addThread.title).toEqual(payload.title);
    expect(addThread.body).toEqual(payload.body);
    expect(addThread.owner).toEqual(payload.owner);
  });
});
