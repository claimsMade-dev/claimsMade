module.exports = (sequelize, type) => sequelize.define('Settings', {
    id: {
      type: type.STRING,
      primaryKey: true,
    },
    key: type.STRING,
    value: type.TEXT,
  });