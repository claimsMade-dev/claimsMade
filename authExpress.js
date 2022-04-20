const authenticateToken = require('./authenticateToken');

const asyncMiddleware = async (req, res, next) => {
  try {
    const user = await authenticateToken(req);
    req.user = user;
    next();
  } catch (error) {
    return res
        .status(error.statusCode || 500)
        .json({ error: error.message });
  }
};

module.exports = asyncMiddleware;
