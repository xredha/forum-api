class ToggleLike {
  constructor(payload) {
    this._verifyPayload(payload);

    const { comment, owner } = payload;

    this.comment = comment;
    this.owner = owner;
  }

  _verifyPayload({ comment, owner }) {
    if (!comment || !owner) {
      throw new Error('TOGGLE_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof comment !== 'string' || typeof owner !== 'string') {
      throw new Error('TOGGLE_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ToggleLike;
