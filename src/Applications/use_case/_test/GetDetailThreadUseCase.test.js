const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');

describe('GetDetailThreadUseCase', () => {
  const commentDeletedText = '**komentar telah dihapus**';
  const replyDeletedText = '**balasan telah dihapus**';

  const useCasePayload = {
    id: 'thread-123',
  };
  const thread = {
    id: useCasePayload.id,
    title: 'test title thread',
    body: 'test body thread',
    date: '2021-06-08T07:22:33.555Z',
    username: 'saputra',
  };
  const comments = [
    {
      id: 'comment-123',
      username: 'galih',
      date: '2021-08-08T07:22:33.555Z',
      content: 'test content comment',
      booldelete: false,
    },
    {
      id: 'comment-234',
      username: 'redha',
      date: '2021-07-08T07:22:33.555Z',
      content: 'content deleted soon :)',
      booldelete: true,
    },
  ];
  const commentsAfterProcessing = [
    {
      id: comments[0].id,
      username: comments[0].username,
      date: comments[0].date,
      content: comments[0].content,
    },
    {
      id: comments[1].id,
      username: comments[1].username,
      date: comments[1].date,
      content: commentDeletedText,
    },
  ];
  const replies = [
    {
      id: 'reply-123',
      username: 'galih',
      date: '2021-08-08T07:23:33.555Z',
      content: 'test content reply',
      commentid: 'comment-123',
      booldelete: false,
    },
    {
      id: 'reply-234',
      username: 'redha',
      date: '2021-08-08T07:23:40.555Z',
      content: 'content deleted soon :)',
      commentid: 'comment-123',
      booldelete: true,
    },
  ];
  const repliesAfterProcessing = [
    {
      id: comments[0].id,
      username: comments[0].username,
      date: comments[0].date,
      content: comments[0].content,
      replies: [
        {
          id: replies[0].id,
          username: replies[0].username,
          date: replies[0].date,
          content: replies[0].content,
        },
        {
          id: replies[1].id,
          username: replies[1].username,
          date: replies[1].date,
          content: replyDeletedText,
        },
      ],
    },
    {
      id: comments[1].id,
      username: comments[1].username,
      date: comments[1].date,
      content: commentDeletedText,
      replies: [],
    },
  ];

  it('should orchestrating the get detail thread action correctly', async () => {
    const expectedDetailThread = new DetailThread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: [
        new DetailComment({
          id: comments[0].id,
          username: comments[0].username,
          date: comments[0].date,
          content: comments[0].content,
          replies: [
            new DetailReply({
              id: replies[0].id,
              username: replies[0].username,
              date: replies[0].date,
              content: replies[0].content,
            }),
            new DetailReply({
              id: replies[1].id,
              username: replies[1].username,
              date: replies[1].date,
              content: replyDeletedText,
            }),
          ],
        }),
        new DetailComment({
          id: comments[1].id,
          username: comments[1].username,
          date: comments[1].date,
          content: commentDeletedText,
          replies: [],
        }),
      ],
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkThreadIfExists = jest
      .fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(thread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(comments));
    mockReplyRepository.getRepliesByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(replies));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    getDetailThreadUseCase._isDeleteCommentProcessing = jest
      .fn()
      .mockImplementation(() => [
        { ...commentsAfterProcessing[0] },
        { ...commentsAfterProcessing[1] },
      ]);
    getDetailThreadUseCase._isDeleteReplyProcessing = jest
      .fn()
      .mockImplementation(() => [
        { ...repliesAfterProcessing[0] },
        { ...repliesAfterProcessing[1] },
      ]);

    const detailThread = await getDetailThreadUseCase.execute(useCasePayload);

    expect(detailThread).toEqual(expectedDetailThread);
    expect(mockThreadRepository.checkThreadIfExists).toBeCalledWith(
      useCasePayload.id,
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.id,
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.id,
    );
    expect(getDetailThreadUseCase._isDeleteCommentProcessing).toBeCalledWith(
      comments,
    );
    expect(getDetailThreadUseCase._isDeleteReplyProcessing).toBeCalledWith(
      comments,
      replies,
    );
  });

  it('should run function _isDeleteCommentProcessing correctly', async () => {
    const getDetailThreadUseCase = new GetDetailThreadUseCase({}, {}, {});

    expect(getDetailThreadUseCase._isDeleteCommentProcessing([])).toHaveLength(0);
    expect(getDetailThreadUseCase._isDeleteCommentProcessing(comments)).toHaveLength(2);
  });

  it('should run function _isDeleteReplyCorrectly correctly', async () => {
    const getDetailThreadUseCase = new GetDetailThreadUseCase({}, {}, {});

    expect(getDetailThreadUseCase._isDeleteReplyProcessing(comments, [])[0].replies)
      .toHaveLength(0);
    expect(getDetailThreadUseCase._isDeleteReplyProcessing(comments, replies)[0].replies)
      .toHaveLength(2);
  });
});
