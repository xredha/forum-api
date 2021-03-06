/* eslint-disable no-await-in-loop */
class GetDetailThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { id } = useCasePayload;

    await this._threadRepository.checkThreadIfExists(id);
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._commentRepository.getCommentsByThreadId(id);
    thread.comments = this._isDeleteCommentProcessing(comments);
    const replies = await this._replyRepository.getRepliesByThreadId(id);
    thread.comments = this._isDeleteReplyProcessing(comments, replies);
    thread.comments = await this._likeCountCommentProcessing(comments);

    return thread;
  }

  _isDeleteCommentProcessing(comments) {
    const commentDeletedText = '**komentar telah dihapus**';
    comments.forEach((comment) => {
      comment.content = comment.booldelete
        ? commentDeletedText
        : comment.content;
      delete comment.booldelete;
    });
    return comments;
  }

  _isDeleteReplyProcessing(comments, replies) {
    const replyDeletedText = '**balasan telah dihapus**';
    for (let i = 0; i < comments.length; i += 1) {
      const filteredReplies = replies.filter(
        (reply) => reply.commentid === comments[i].id,
      );
      filteredReplies.forEach((reply) => {
        reply.content = reply.booldelete ? replyDeletedText : reply.content;
        delete reply.commentid;
        delete reply.booldelete;
      });
      comments[i].replies = filteredReplies;
    }
    return comments;
  }

  async _likeCountCommentProcessing(comments) {
    for (let i = 0; i < comments.length; i += 1) {
      comments[i].likeCount = await this._likeRepository.getLikeCountByCommentId(comments[i].id);
    }
    return comments;
  }
}

module.exports = GetDetailThreadUseCase;
