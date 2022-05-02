const AddComment = require('../AddComment');

describe('AddComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      content: 'test content comment'
    };

    expect(() => new AddComment(payload)).toThrowError(
      'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: {},
      thread: [],
      owner: 123
    };

    expect(() => new AddComment(payload)).toThrowError(
      'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create addComment object correctly', () => {
    const payload = {
      content: 'test content comment',
      thread: 'thread-123',
      owner: 'owner-123'
    };

    const addComment = new AddComment(payload);

    expect(addComment.content).toEqual(payload.content);
    expect(addComment.thread).toEqual(payload.thread);
    expect(addComment.owner).toEqual(payload.owner);
  });
});
