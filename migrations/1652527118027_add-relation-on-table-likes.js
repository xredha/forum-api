/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addConstraint('likes', 'likes_user_id_fk', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('likes', 'likes_comment_id_fk', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('likes', 'likes_user_id_comment_id_unique', {
    unique: ['user_id', 'comment_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'likes_user_id_fk', {
    cascade: true,
  });

  pgm.dropConstraint('likes', 'likes_comment_id_fk', {
    cascade: true,
  });

  pgm.dropConstraint('likes', 'likes_user_id_comment_id_unique');
};
