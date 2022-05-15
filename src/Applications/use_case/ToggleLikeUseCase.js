const ToggleLike = require('../../Domains/likes/entities/ToggleLike');

class ToggleLikeUseCase {
  constructor({ likeRepository, threadRepository, commentRepository }) {
    this._likeRepository = likeRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams, useCaseUserIdCredentials) {
    const { threadId, commentId } = useCaseParams;

    await this._threadRepository.checkThreadIfExists(threadId);
    await this._commentRepository.checkCommentIfExists(commentId);

    const toggleLike = new ToggleLike({
      comment: commentId,
      owner: useCaseUserIdCredentials,
    });

    const isLiked = await this._likeRepository.checkCommentIsLiked(toggleLike);
    if (isLiked) {
      await this._likeRepository.unlikeComment(toggleLike);
    } else {
      await this._likeRepository.likeComment(toggleLike);
    }
  }
}

module.exports = ToggleLikeUseCase;
