const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.putToggleLikeHandler,
    options: {
      auth: 'forum-api_jwt',
    },
  },
]);

module.exports = routes;
