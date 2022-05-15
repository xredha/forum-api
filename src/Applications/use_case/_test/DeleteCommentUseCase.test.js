const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const useCaseParams = {
      id: 'comment-123',
      thread: 'thread-123',
    };
    const useCaseUserIdCredentials = 'user-123';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.checkThreadIfExists = jest
      .fn(() => Promise.resolve());
    mockCommentRepository.checkCommentIfExists = jest
      .fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest
      .fn(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    await deleteCommentUseCase.execute(useCaseParams, useCaseUserIdCredentials);

    expect(mockThreadRepository.checkThreadIfExists).toBeCalledWith(
      useCaseParams.thread,
    );
    expect(mockCommentRepository.checkCommentIfExists).toBeCalledWith(
      useCaseParams.id,
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCaseParams.id,
      useCaseUserIdCredentials,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCaseParams.id,
    );
  });
});
