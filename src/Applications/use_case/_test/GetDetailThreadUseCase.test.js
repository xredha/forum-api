const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
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

  it('should orchestrating the get detail thread action correctly', async () => {
    const expectedDetailThread = new DetailThread({
      id: useCasePayload.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: [],
    });
    const expectedComments = [
      {
        id: 'comment-123',
        username: 'galih',
        date: '2021-08-08T07:22:33.555Z',
        content: 'test content comment',
      },
      {
        id: 'comment-234',
        username: 'redha',
        date: '2021-07-08T07:22:33.555Z',
        content: '**komentar telah dihapus**',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkThreadIfExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(thread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(comments));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    getDetailThreadUseCase._isDeleteCommentProcessing = jest
      .fn()
      .mockImplementation(() => expectedComments);

    const detailThread = await getDetailThreadUseCase.execute(useCasePayload);

    expect(detailThread).toEqual(
      new DetailThread({
        ...expectedDetailThread,
        comments: expectedComments,
      })
    );
    expect(mockThreadRepository.checkThreadIfExists).toBeCalledWith(
      useCasePayload.id
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.id
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.id
    );
    expect(getDetailThreadUseCase._isDeleteCommentProcessing).toBeCalledWith(
      comments
    );
  });

  it('should run function _isDeleteCommentProcessing correctly', async () => {
    const emptyComments = [];
    
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const resultEmptyComments = await getDetailThreadUseCase._isDeleteCommentProcessing(emptyComments);
    const resultHaveComments = await getDetailThreadUseCase._isDeleteCommentProcessing(comments);

    expect(resultEmptyComments).toHaveLength(0);
    expect(resultHaveComments).toBeDefined();
    expect(resultHaveComments).toHaveLength(2);
  })
});
