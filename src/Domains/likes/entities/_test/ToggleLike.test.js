const ToggleLike = require('../ToggleLike');

describe('ToggleLike entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      comment: 'comment-123',
    };

    expect(() => new ToggleLike(payload)).toThrowError(
      'TOGGLE_LIKE.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      comment: {},
      owner: [],
    };

    expect(() => new ToggleLike(payload)).toThrowError(
      'TOGGLE_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create toggleLike object correctly', () => {
    const payload = {
      comment: 'comment-123',
      owner: 'user-123',
    };

    const toggleLike = new ToggleLike(payload);

    expect(toggleLike.comment).toEqual(payload.comment);
    expect(toggleLike.owner).toEqual(payload.owner);
  });
});
