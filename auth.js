const authenticateToken = require('./authenticateToken');

const authMiddleware = config =>
    // might set default options in config
     ({
       before: async (handler, next) => {
        // might read options from `config`
         const user = await authenticateToken(handler.event);
         handler.event.user = user;
         // return next();
       },
       onError: handler => handler.callback(null, {
         statusCode: handler.error.statusCode,
         headers: { 'Content-Type': 'text/plain',
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Credentials': true },
         body: JSON.stringify({
           error: handler.error.message,
         }),
       }),
     });
module.exports = authMiddleware;
