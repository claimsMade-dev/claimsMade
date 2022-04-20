const jwt = require('jsonwebtoken');
const connectToDatabase = require('../../db');
const { HTTPError } = require('../../utils/httpResp');
const { validateLogin } = require('./validation');

module.exports.login = async (event) => {
    try {
      const input = JSON.parse(event.body);
      validateLogin(input);
      const email = input.email;
      const password = input.password;
      const { Users, Op } = await connectToDatabase();
      const userObject = await Users.findOne({
        where: {
          email,
          is_deleted: { [Op.not]: true }
        },
        logging:console.log
      });
  
      if (!userObject) throw new HTTPError(404, 'Couldn\'t find your account');
      if (!await userObject.validPassword(password)) {
        throw new HTTPError(401, 'Wrong password. Try again or click Forgot password to reset it');
      }
  
      await userObject.save();
      const tokenUser = {
        id: userObject.id,
        role: userObject.role,
      };
      const token = jwt.sign(
        tokenUser,
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRATION_TIME,
        }
      );
      const responseData = {
        user: {
          name: userObject.name,
          role: userObject.role,
          is_admin: userObject.is_admin
        },
      };
    responseData.authToken = `JWT ${token}`;
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
      const errorResponseData = { error: err.message || 'Could not create the users.' };
      return {
        statusCode: err.statusCode || 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(errorResponseData),
      };
    }
  };