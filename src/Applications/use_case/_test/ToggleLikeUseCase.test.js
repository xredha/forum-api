const ToggleLike = require('../../../Domains/likes/entities/ToggleLike');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ToggleLikeUseCase = require('../ToggleLikeUseCase');

describe('ToggleLikeUseCase', () => {
  it('should orchestrating the add thread action correctly when comment is liked', async () => {
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseUserIdCredentials = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.checkThreadIfExists = jest
      .fn(() => Promise.resolve());
    mockCommentRepository.checkCommentIfExists = jest
      .fn(() => Promise.resolve());
    mockLikeRepository.checkCommentIsLiked = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.unlikeComment = jest
      .fn(() => Promise.resolve());
    mockLikeRepository.likeComment = jest
      .fn(() => Promise.resolve());

    const toggleLikeUseCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await toggleLikeUseCase.execute(useCaseParams, useCaseUserIdCredentials);

    expect(mockThreadRepository.checkThreadIfExists).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkCommentIfExists).toBeCalledWith(useCaseParams.commentId);
    expect(mockLikeRepository.checkCommentIsLiked).toBeCalledWith(new ToggleLike({
      comment: useCaseParams.commentId,
      owner: useCaseUserIdCredentials,
    }));
    expect(mockLikeRepository.unlikeComment).toBeCalledWith(new ToggleLike({
      comment: useCaseParams.commentId,
      owner: useCaseUserIdCredentials,
    }));
  });

  it('should orchestrating the add thread action correctly when comment is not liked', async () => {
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseUserIdCredentials = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.checkThreadIfExists = jest
      .fn(() => Promise.resolve());
    mockCommentRepository.checkCommentIfExists = jest
      .fn(() => Promise.resolve());
    mockLikeRepository.checkCommentIsLiked = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.unlikeComment = jest
      .fn(() => Promise.resolve());
    mockLikeRepository.likeComment = jest
      .fn(() => Promise.resolve());

    const toggleLikeUseCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await toggleLikeUseCase.execute(useCaseParams, useCaseUserIdCredentials);

    expect(mockThreadRepository.checkThreadIfExists).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkCommentIfExists).toBeCalledWith(useCaseParams.commentId);
    expect(mockLikeRepository.checkCommentIsLiked).toBeCalledWith(new ToggleLike({
      comment: useCaseParams.commentId,
      owner: useCaseUserIdCredentials,
    }));
    expect(mockLikeRepository.likeComment).toBeCalledWith(new ToggleLike({
      comment: useCaseParams.commentId,
      owner: useCaseUserIdCredentials,
    }));
  });
});
