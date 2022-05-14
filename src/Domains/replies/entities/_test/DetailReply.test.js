const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      id: 'reply-123',
    };

    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: [],
      content: {},
      date: '00:50:57.265345+07',
      username: [],
    };

    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create detailReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'test content reply',
      date: '00:50:57.265345+07',
      username: 'galih',
    };

    const detailReply = new DetailReply(payload);

    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });
});
