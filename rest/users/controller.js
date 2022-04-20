const uuid = require('uuid');
const middy = require('@middy/core');
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop');
const authMiddleware = require('../../auth');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../../db');
const { HTTPError } = require('../../utils/httpResp');
const { validateSignup, validateUpdateUser, validateReadAllUsers, validateCreateUser, validateResetPassword } = require('./validation');
const { authorizeUpdate, authorizeCreate, authorizeGetAll } = require('./authorize');
const { QueryTypes } = require('sequelize');
const CryptoJS = require("crypto-js");

const signUp = async (event) => {
  //const input = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;  
  try {
    const { Users, Op, PasswordHistory, Practices } = await connectToDatabase();
    const input = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const dataObject = Object.assign(input, {
      id: input.user_id || uuid.v4(),
    });

    validateSignup(dataObject);

    const userObject = await Users.findOne({
      where: {
        email: dataObject.email,
        is_deleted: { [Op.not]: true }
      },
    });

    console.log("userObject" + JSON.stringify(userObject));

    if (userObject) throw new HTTPError(400, `User with email: ${dataObject.email} already exist`);

    const practice = await Practices.create({ name: dataObject.practice_name, id: input.practice_id || uuid.v4() });

    Object.assign(dataObject, { practice_id: practice.id }, { is_admin: true }, { is_deleted: false });

    const user = await Users.create(dataObject);
    await PasswordHistory.create({ email: dataObject.email, password: user.password, id: uuid.v4() });

    const tokenUser = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(
      tokenUser,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        authToken: `JWT ${token}`,
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: err.message || 'Could not create the users.' }),
    };
  }
};


const update = async (event) => {
  try {
    const params = event.params || event.pathParameters;
    const input = JSON.parse(event.body);
    const loggedInUser = event.user;
    const user = input.user;
    const userId = params.id;
    const { Users, Op } = await connectToDatabase();

    authorizeUpdate(loggedInUser);
    validateUpdateUser(user);
    const userObject = await Users.findOne({ where: { id: userId, is_deleted: { [Op.not]: true } }, });
    if (!userObject) throw new HTTPError(400, `User not found to update`);

    if (loggedInUser.id === userId) {
      if (user.name) {
        userObject.name = user.name;
      }
      if (user.password) {
        userObject.password = await userObject.generateNewPassword(user.password);
      }
      const result = await userObject.save();

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(result),
      };
    }

    if (user.password) {
      user.password = await userObject.generateNewPassword(user.password);
    }
    const updatedUser = Object.assign(userObject, user);
    const result = await updatedUser.save();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: err.message || 'Could not fetch the user.' }),
    };
  }
};


const destroy = async (event) => {
  try {
    const params = event.params || event.pathParameters;
    const { Users, Op } = await connectToDatabase();
    const logginedUser = event.user;

    if (!logginedUser.is_admin) throw new HTTPError(400, `You are not admin`);
    if (logginedUser.id === params.id) throw new HTTPError(403, `forbidden`);
    const user = await Users.destroy({ where: { id: params.id } });
    if(user < 1) throw new HTTPError(404, 'User not found');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify("User removed"),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: err.message || 'Could not update user.' }),
    };
  }
}

const create = async (event) => {
  try {
    let id;
    const input = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    if (process.env.NODE_ENV === 'test' && input.id) id = input.id;

    authorizeCreate(event.user);

    input.practice_id = event.user.practice_id;
    const dataObject = Object.assign(input, { id: input.id || uuid.v4() }, { is_deleted: false });

    validateCreateUser(dataObject);
    const { Users, Practices, PasswordHistory, Op } = await connectToDatabase();
    const userObject = await Users.findOne({
      where: {
        email: dataObject.email,
        is_deleted: { [Op.not]: true }
      },
    });

    if (userObject) throw new HTTPError(400, `User with email id: ${dataObject.email} already exist`);


    const userModel = await Users.create(dataObject);


    await PasswordHistory.create({ email: dataObject.email, password: userModel.password, id: uuid.v4() });

    const user = userModel.get({ plain: true });

    if (user.practice_id) {
      const practiceData = await Practices.findOne({ where: { id: user.practice_id }, });
      if (practiceData) {
        user.practice_name = practiceData.name;
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(user),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: err.message || 'Could not create the user.' }),
    };
  }
};

const getOne = async (event) => {
  try {
    const params = event.params || event.pathParameters;
    const { Users, Practices, Op } = await connectToDatabase();
    const user = await Users.findOne({ where: { id: params.id, is_deleted: { [Op.not]: true } } });
    if (!user) throw new HTTPError(404, `User with id: ${params.id} was not found`);
    const userObj = await user.get({ plain: true });
    const practiceData = await Practices.findOne({ where: { id: userObj.practice_id, is_deleted: { [Op.not]: true } } });
    if (practiceData && 'name' in practiceData) userObj.practice_name = practiceData.name;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(userObj),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: err.message || 'Could not fetch the Users.' }),
    };
  }
};

const getAll = async (event) => {
  try {
    const { Op, sequelize, Practices, Users } = await connectToDatabase();
    const urlParams = event.query || {};
    let searchKey = '';
    const sortKey = {};

    let sortQuery = '';
    let searchQuery = '';

    const query = event.headers;
    if (query.offset) query.offset = parseInt(query.offset, 10);
    if (query.limit) query.limit = parseInt(query.limit, 10);
    if (query.search) searchKey = query.search;

    let codeSnip = ''; // limit,offset
    let codeSnip2 = ''; // totalcount
    const practice_id = event.user.practice_id;

    let where = `WHERE Users.is_deleted IS NOT true  AND Users.practice_id ='${practice_id}' AND Users.id !='${event.user.id}'`;

    /**Sort**/
    if (query.sort == 'false') {
      sortQuery += ` ORDER BY Users.createdAt DESC`
    } else if (query.sort != 'false') {
      query.sort = JSON.parse(query.sort);
      sortKey.column = query.sort.column;
      sortKey.type = query.sort.type;

      if (sortKey.column != '' && sortKey.column) {
        sortQuery += ` ORDER BY ${sortKey.column}`; //TableName.colum_name
      }
      if (sortKey.type != '' && sortKey.type) {
        sortQuery += ` ${sortKey.type}`;//asc,desc
      }
    }

    /**Search**/
    if (searchKey != 'false' && searchKey.length >= 1 && searchKey != '') {
      searchQuery = ` Users.role LIKE '%${searchKey}%' OR Users.email LIKE '%${searchKey}%' OR Users.name LIKE '%${searchKey}%' OR Practices.name LIKE '%${searchKey}%' `;
    }

    if (searchQuery != '' && sortQuery != '') {
      codeSnip = where + ' AND (' + searchQuery + ')' + sortQuery + ` LIMIT ${query.limit} OFFSET ${query.offset}`;
      codeSnip2 = where + ' AND (' + searchQuery + ')' + sortQuery;
    } else if (searchQuery == '' && sortQuery != '') {
      codeSnip = where + sortQuery + ` LIMIT ${query.limit} OFFSET ${query.offset}`;
      codeSnip2 = where + sortQuery;
    } else if (searchQuery != '' && sortQuery == '') {
      codeSnip = where + ' AND (' + searchQuery + ')' + ` LIMIT ${query.limit} OFFSET ${query.offset}`;
      codeSnip2 = where + ' AND (' + searchQuery + ')';
    } else if (searchQuery == '' && sortQuery == '') {
      codeSnip = where + ` LIMIT ${query.limit} OFFSET ${query.offset}`;
      codeSnip2 = where;
    }

    let sqlQuery = 'SELECT Users.id, Users.name, Users.practice_id, Users.email,Users.role, Users.is_admin, ' +
      'Practices.name AS practice_name FROM Users inner JOIN Practices ON Users.practice_id = Practices.id ' + codeSnip;

    let sqlQueryCount = 'SELECT Users.id, Users.name, Users.practice_id, Users.email,Users.role, Users.is_admin, ' +
      'Practices.name AS practice_name FROM Users inner JOIN Practices ON Users.practice_id = Practices.id ' + codeSnip2;

    const serverData = await sequelize.query(sqlQuery, {
      type: QueryTypes.SELECT
    });
    const TableDataCount = await sequelize.query(sqlQueryCount, {
      type: QueryTypes.SELECT
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Expose-Headers': 'totalPageCount',
        'totalPageCount': TableDataCount.length
      },
      body: JSON.stringify(serverData),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: err.message || 'Could not fetch the Users.' }),
    };
  }
}

const getMe = async (event, context) => {
  try {
    const { Practices, PasswordHistory, Op } = await connectToDatabase();
    const user = event.user;
    if (user.practice_id) {
      const practiceDetails = await Practices.findOne({ where: { id: event.user.practice_id }, });
      if (practiceDetails) {
        user.practiceDetails = practiceDetails.get({ plain: true });
      }
    }

    const lastPasswordChangeObject = await PasswordHistory.findOne({
      order: [
        ['createdAt', 'DESC'],
      ],
      where: {
        email: user.email,
      }
    });

    if (lastPasswordChangeObject) {
      user.lastPasswordChangeDate = new Date(lastPasswordChangeObject.createdAt);
    } else {
      const days30DaysBack = new Date();
      days30DaysBack.setDate(days30DaysBack.getDate() - 90);
      user.lastPasswordChangeDate = days30DaysBack;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(user),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': false
      },
      body: JSON.stringify({ error: err.message || 'Could not fetch the Users.' }),
    };
  }
};

const sessionTokenGenerate = async (event) => {
  try {
    const { Users, Op, Settings } = await connectToDatabase();
    const input = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const userId = input.id;
    const userObject = await Users.findOne({ where: { id: userId, is_deleted: { [Op.not]: true } }, });
    const userPlain = userObject.get({ plain: true });

    const tokenUser = {
      id: userPlain.id,
      role: userPlain.role,
    };
    const token = jwt.sign(
      tokenUser,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }
    );
    const authToken = `JWT ${token}`;
    const ciphertext = CryptoJS.AES.encrypt(authToken, userId).toString();
    const responseData = {
      user: {
        name: userPlain.name,
        role: userPlain.role,
      },
    };
    responseData.authToken = ciphertext;
    const settingsObj = await Settings.findOne({ where: { key: 'global_settings' } });
    if (settingsObj) {
      responseData.session_timeout = JSON.parse(settingsObj.value).session_timeout;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(responseData),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: err.message || 'Cannot Generate session Token.' }),
    };
  }
};


const changePassword = async (event) => {
  try {
    const input = JSON.parse(event.body);
    validateResetPassword(input);
    const { Users, PasswordHistory, Op } = await connectToDatabase();
    const userObject = await Users.findOne({
      where: {
        is_deleted: { [Op.not]: true },
        id: event.user.id
      }
    });
    if (await userObject.checkIfLast6Password(input.new_password, PasswordHistory)) throw new HTTPError(401, 'Can not use any last 6 past password');
    userObject.password = await userObject.generateNewPassword(input.new_password);
    await userObject.save();
    await PasswordHistory.create({ email: userObject.email, password: userObject.password, id: uuid.v4() });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        status: 'ok',
        message: 'Password Changed',
      }),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: err.message || 'Could not update the Users.' }),
    };
  }

};


module.exports.destroy = middy(destroy).use(authMiddleware()).use(doNotWaitForEmptyEventLoop());
module.exports.update = middy(update).use(authMiddleware()).use(doNotWaitForEmptyEventLoop());
module.exports.signUp = signUp;
module.exports.create = middy(create).use(authMiddleware()).use(doNotWaitForEmptyEventLoop());
module.exports.getOne = middy(getOne).use(authMiddleware()).use(doNotWaitForEmptyEventLoop());
module.exports.getAll = getAll;
module.exports.getMe = middy(getMe).use(authMiddleware()).use(doNotWaitForEmptyEventLoop());;
module.exports.sessionTokenGenerate = sessionTokenGenerate;
module.exports.changePassword = middy(changePassword).use(authMiddleware()).use(doNotWaitForEmptyEventLoop());

