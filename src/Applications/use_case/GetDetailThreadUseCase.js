class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { id } = useCasePayload;

    await this._threadRepository.checkThreadIfExists(id);
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._commentRepository.getCommentsByThreadId(id);
    thread.comments = this._isDeleteCommentProcessing(comments);
    
    return thread;
  }

  _isDeleteCommentProcessing(comments) {
    const commentDeletedText = '**komentar telah dihapus**';
    comments.forEach(comment => {
      comment.content = comment.booldelete ? commentDeletedText : comment.content;
      delete comment.booldelete;
    });
    return comments;
  }
}

module.exports = GetDetailThreadUseCase;
