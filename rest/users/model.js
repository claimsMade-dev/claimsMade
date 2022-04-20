const bcrypt = require('bcryptjs');

module.exports = (sequelize, type) => {
  const User = sequelize.define('Users', {
    id: {
      type: type.STRING,
      primaryKey: true,
    },
    name: type.STRING,
    email: type.STRING,
    password: type.STRING,
    practice_id: type.STRING,
    role: type.STRING,
    is_admin: type.BOOLEAN,
    is_deleted: type.BOOLEAN,
  },{
    hooks: {
      async beforeCreate(user) {
        const salt = await bcrypt.genSalt(); 
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  },);

  User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.generateNewPassword = async function (password) {
    const salt = await bcrypt.genSalt(); 
    return await bcrypt.hash(password, salt);
  };

  User.prototype.checkIfLast6Password = async function (password, PasswordHistory) {
    const query = {
      limit: 6,
      order: [
        ['createdAt', 'DESC'],
      ],
      where: { email: this.email },
    };
    const pastPasswords = await PasswordHistory.findAll(query);
    if (!pastPasswords.length) {
      return false;
    }
    let matchedAnyLast6Password = false;
    for (let i = 0; i < pastPasswords.length; i += 1) {
      const pastPasswordObject = pastPasswords[i];
      const passwordMatchResult = await bcrypt.compare(password, pastPasswordObject.password);
      if (passwordMatchResult) {
        matchedAnyLast6Password = true;
      }
    }
    return matchedAnyLast6Password;
  };

  return User;
};

