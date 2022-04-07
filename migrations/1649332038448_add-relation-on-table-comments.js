/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addConstraint('comments', 'comments_user_id_fk', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('comments', 'comments_thread_id_fk', {
    foreignKeys: {
      columns: 'thread_id',
      references: 'threads(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('comments', 'comments_user_id_fk', {
    cascade: true,
  });

  pgm.dropConstraint('comments', 'comments_thread_id_fk', {
    cascade: true,
  });
};
