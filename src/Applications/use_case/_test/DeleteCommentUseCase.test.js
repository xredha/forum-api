const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      id: 'comment-123',
      thread: 'thread-123',
    };
    const useCaseUserIdCredentials = 'user-123';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.checkThreadIfExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentIfExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    await deleteCommentUseCase.execute(useCasePayload, useCaseUserIdCredentials);

    expect(mockThreadRepository.checkThreadIfExists).toBeCalledWith(
      useCasePayload.thread
    );
    expect(mockCommentRepository.checkCommentIfExists).toBeCalledWith(
      useCasePayload.id
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCasePayload.id,
      useCaseUserIdCredentials
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.id
    );
  });
});
