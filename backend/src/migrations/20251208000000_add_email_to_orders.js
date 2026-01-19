exports.up = (pgm) => {
  pgm.addColumns('orders', {
    email: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('orders', ['email']);
};
