const AddedReply = require('../AddedReply');

describe('AddedReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      id: 'reply-123',
    };

    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: {},
      owner: [],
    };

    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create addedReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'test content reply',
      owner: 'user-123',
    };

    const addedReply = new AddedReply(payload);

    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
