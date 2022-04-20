const jwt = require('jsonwebtoken');
const { HTTPError } = require('./utils/httpResp');
const connectToDatabase = require('./db');

// for auth based on jwt token
const authenticateToken = async function (event) {
  const headers = event.headers;

  let decodedAuthToken;
  
  if (!headers) throw new HTTPError(401, 'no header in request');

  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) throw new HTTPError(401, 'no auth header in request');

  const authHeaderSplit = authHeader.split(' ');
  if (authHeaderSplit.length !== 2) throw new HTTPError(401, 'auth header in wrong format');

  const authToken = authHeaderSplit[1];
  if (!authToken) throw new HTTPError(401, 'no auth token');

  try {
    decodedAuthToken = jwt.verify(authToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new HTTPError(401, 'invalid auth token');
  }

  if (!decodedAuthToken) {
    throw new HTTPError(401, 'invalid auth token');
  }
  if (decodedAuthToken && decodedAuthToken.exp) {
    const cunnetDate = new Date();
    const expiryDate = new Date(decodedAuthToken.exp * 1000);
    if (expiryDate < cunnetDate) throw new HTTPError(401, 'auth token expired');
  }

  if (!decodedAuthToken.id) throw new HTTPError(401, 'no id in token');

  const { Users } = await connectToDatabase();
  const user = await Users.findOne({where:{id:decodedAuthToken.id}});
  if (!user) throw new HTTPError(401, 'no such user');
  const plainUser = user.get({ plain: true });
  return plainUser;
};

module.exports = authenticateToken;
