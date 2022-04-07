/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addConstraint('replies', 'replies_user_id_fk', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('replies', 'replies_comment_id_fk', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('replies', 'replies_user_id_fk', {
    cascade: true,
  });

  pgm.dropConstraint('replies', 'replies_comment_id_fk', {
    cascade: true,
  });
};
