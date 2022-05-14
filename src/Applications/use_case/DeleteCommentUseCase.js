class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseUserIdCredentials) {
    const { id, thread } = useCasePayload;

    await this._threadRepository.checkThreadIfExists(thread);
    await this._commentRepository.checkCommentIfExists(id);
    await this._commentRepository.verifyCommentOwner(
      id,
      useCaseUserIdCredentials,
    );
    await this._commentRepository.deleteComment(id);
  }
}

module.exports = DeleteCommentUseCase;
