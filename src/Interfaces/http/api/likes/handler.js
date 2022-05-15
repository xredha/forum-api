const ToggleLikeUseCase = require('../../../../Applications/use_case/ToggleLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putToggleLikeHandler = this.putToggleLikeHandler.bind(this);
  }

  async putToggleLikeHandler(request, h) {
    const { params } = request;
    const userId = request.auth.credentials.id;
    const toggleLikeUseCase = this._container.getInstance(ToggleLikeUseCase.name);
    await toggleLikeUseCase.execute(params, userId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
