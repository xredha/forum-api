/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addConstraint('threads', 'threads_user_id_fk', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('threads', 'threads_user_id_fk', {
    cascade: true,
  });
};
