const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, useCaseParams, useCaseUserIdCredentials) {
    const { content } = useCasePayload;
    const { threadId, commentId } = useCaseParams;

    await this._threadRepository.checkThreadIfExists(threadId);
    await this._commentRepository.checkCommentIfExists(commentId);
    
    const addReply = new AddReply({
      content,
      comment: commentId,
      owner: useCaseUserIdCredentials
    })
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
