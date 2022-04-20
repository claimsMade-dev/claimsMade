module.exports = (sequelize, type) => sequelize.define('PasswordHistory', {
    id: {
      type: type.STRING,
      primaryKey: true,
    },
    email: type.STRING,
    password: type.STRING,
  });
  