module.exports = (sequelize, type) => sequelize.define('Practices', {
    id: {
      type: type.STRING,
      primaryKey: true,
    },
    name: type.STRING,
    address: type.STRING,
    street: type.STRING,
    city: type.STRING,
    state: type.STRING,
    zip_code: type.STRING, 
    logoFile: type.STRING,
    phone: type.STRING,
    is_deleted: type.BOOLEAN
  });
  