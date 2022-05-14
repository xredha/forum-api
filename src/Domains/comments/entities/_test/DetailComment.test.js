const DetailComment = require('../DetailComment');

describe('DetailComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      id: 'comment-123',
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: [],
      username: [],
      date: '00:50:57.265345+07',
      replies: [],
      content: {},
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create detailComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'galih',
      date: '00:50:57.265345+07',
      replies: [{}],
      content: 'test content comment',
    };

    const detailComment = new DetailComment(payload);

    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.replies).toEqual(payload.replies);
    expect(detailComment.content).toEqual(payload.content);
  });
});
