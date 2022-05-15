class DeleteReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams, useCaseUserIdCredentials) {
    const { threadId, commentId, replyId } = useCaseParams;

    await this._threadRepository.checkThreadIfExists(threadId);
    await this._commentRepository.checkCommentIfExists(commentId);
    await this._replyRepository.checkReplyIfExists(replyId);
    await this._replyRepository.verifyReplyOwner(
      replyId,
      useCaseUserIdCredentials,
    );

    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
