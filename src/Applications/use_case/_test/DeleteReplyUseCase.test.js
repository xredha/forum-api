const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };
    const useCaseUserIdCredentials = 'user-123';

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.checkThreadIfExists = jest
      .fn(() => Promise.resolve());
    mockCommentRepository.checkCommentIfExists = jest
      .fn(() => Promise.resolve());
    mockReplyRepository.checkReplyIfExists = jest
      .fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest
      .fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest
      .fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    await deleteReplyUseCase.execute(useCasePayload, useCaseUserIdCredentials);

    expect(mockThreadRepository.checkThreadIfExists).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.checkCommentIfExists).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.checkReplyIfExists).toBeCalledWith(
      useCasePayload.replyId,
    );
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(
      useCasePayload.replyId,
      useCaseUserIdCredentials,
    );
    expect(mockReplyRepository.deleteReply).toBeCalledWith(
      useCasePayload.replyId,
    );
  });
});
