class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, comment, owner } = payload;

    this.content = content;
    this.comment = comment;
    this.owner = owner;
  }

  _verifyPayload({ content, comment, owner }) {
    if (!content || !comment || !owner) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof comment !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;
