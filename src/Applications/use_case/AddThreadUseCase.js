const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseUserIdCredentials) {
    const { title, body } = useCasePayload;
    const addThread = new AddThread({
      title,
      body,
      owner: useCaseUserIdCredentials,
    });
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
