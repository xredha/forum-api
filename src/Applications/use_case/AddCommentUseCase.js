const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseThreadId, useCaseUserIdCredentials) {
    const { content } = useCasePayload;
    await this._threadRepository.checkThreadIfExists(useCaseThreadId);
    const addComment = new AddComment({
      content,
      thread: useCaseThreadId,
      owner: useCaseUserIdCredentials,
    });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
