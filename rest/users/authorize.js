const { HTTPError } = require('../../utils/httpResp');
const claimMadeRoles = ['physician', 'staff'];
const userReadAccessRoles = ['physician'];


exports.authorizeUpdate = function (user) {
    if (!user.is_admin) {
      throw new HTTPError(403, 'forbidden');
    }
  };

exports.authorizeCreate = function (user) {
    if (!claimMadeRoles.includes(user.role) || !user.is_admin) {
      throw new HTTPError(403, 'you don\'t have access');
    }
  };

exports.authorizeGetAll = function (user) {
    if (!userReadAccessRoles.includes(user.role) || !user.is_admin) {
      throw new HTTPError(403, 'you don\'t have access');
    }
  };