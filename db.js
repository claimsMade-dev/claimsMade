const Sequelize = require('sequelize');
const PracticesModel = require('./rest/practices/model');
const UsersModel = require('./rest/users/model');
const PasswordHistoryModel = require('./rest/users/password_history_model');
const SettingsModel = require('./rest/settings/model');

const Op = Sequelize.Op;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialectOptions: { decimalNumbers: true },
    logging:false,  
  }
);

const Practices = PracticesModel(sequelize, Sequelize);
const Users = UsersModel(sequelize, Sequelize);
const PasswordHistory = PasswordHistoryModel(sequelize, Sequelize);
const Settings = SettingsModel(sequelize, Sequelize);

const Models = {
  Op,
  Practices,
  Users,
  PasswordHistory,
  Settings,
  sequelize
};
const connection = {};

module.exports = async () => {
  if (connection.isConnected) {
    console.log('=> Using existing connection.');
    return Models;
  }
  await sequelize.sync();
  await sequelize.authenticate();
  connection.isConnected = true;
  console.log('=> Created a new connection.');
  return Models;
};
