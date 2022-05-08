const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'test content reply',
    };
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseUserIdCredentials = 'user-123';
    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCaseUserIdCredentials,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkThreadIfExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentIfExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    const addReply = await addReplyUseCase.execute(
      useCasePayload,
      useCaseParams,
      useCaseUserIdCredentials
    );

    expect(mockThreadRepository.checkThreadIfExists).toBeCalledWith(
      useCaseParams.threadId
    );
    expect(mockCommentRepository.checkCommentIfExists).toBeCalledWith(
      useCaseParams.commentId
    );
    expect(addReply).toStrictEqual(expectedAddedReply);
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply({
        content: useCasePayload.content,
        comment: useCaseParams.commentId,
        owner: useCaseUserIdCredentials,
      })
    );
  });
});
