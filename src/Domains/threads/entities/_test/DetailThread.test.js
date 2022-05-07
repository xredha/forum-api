const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      id: 'thread-123'
    };

    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: [],
      title: 123,
      body: {},
      username: [],
      date: '00:50:57.265345+07',
      comments: []
    };

    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create detailThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'test title thread',
      body: 'test body thread',
      username: 'galih',
      date: '00:50:57.265345+07',
      comments: [{}]
    };

    const detailThread = new DetailThread(payload);

    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});
