const Validator = require('validatorjs');
const commonPassword = require('common-password-checker');
const { HTTPError } = require('../../utils/httpResp');

exports.validateSignup = function (data) {
    const rules = {
      name: 'required|min:4|max:64',
      email: 'required|email|min:4|max:64',
      password: 'required|min:4|max:64',
      role: 'required',
    };
  
    const validation = new Validator(data, rules);
  
    if (validation.fails()) {
      throw new HTTPError(400, validation.errors.all());
    }
  
    const hasUpperCase = /[A-Z]/.test(data.password);
    const hasLowerCase = /[a-z]/.test(data.password);
    const hasNumbers = /\d/.test(data.password);
    const hasNonalphas = /\W/.test(data.password);
    const hasTripple = /(.)\1\1/.test(data.password);
  
  
    if (!hasUpperCase && !hasLowerCase) throw new HTTPError(400, 'Password must contain one alphabetic character');
    if (!hasNumbers && !hasNonalphas) throw new HTTPError(400, 'Password must contain one numeric or special character');
    if (hasTripple) throw new HTTPError(400, 'Password must not have consecutive characters');
    if (commonPassword(data.password)) throw new HTTPError(400, 'Password must not be a common or easily guessable password');
  
    const validRoles = ['physician', 'staff'];
    if (!validRoles.includes(data.role)) throw new HTTPError(400, 'Invalid role');
  };

  exports.validateUpdateUser = function (data) {
    const rules = {
      name: 'min:4|max:64',
      email: 'email|min:4|max:64',
      password: 'min:4|max:64',
      is_admin: 'boolean'
    };
    const validation = new Validator(data, rules);
  
    if (validation.fails()) {
      throw new HTTPError(400, validation.errors.all());
    }
  
    if (data.password) {
      const hasUpperCase = /[A-Z]/.test(data.password);
      const hasLowerCase = /[a-z]/.test(data.password);
      const hasNumbers = /\d/.test(data.password);
      const hasNonalphas = /\W/.test(data.password);
      const hasTripple = /(.)\1\1/.test(data.password);
  
  
      if (!hasUpperCase && !hasLowerCase) throw new HTTPError(400, 'Password must contain one alphabetic character');
      if (!hasNumbers && !hasNonalphas) throw new HTTPError(400, 'Password must contain one numeric or special character');
      if (hasTripple) throw new HTTPError(400, 'Password must not have consecutive characters');
      if (commonPassword(data.password)) throw new HTTPError(400, 'Password must not be a common or easily guessable password');
    }
    
    const validRoles = ['physician', 'staff'];
    if (data.role && !validRoles.includes(data.role)) throw new HTTPError(400, 'Invalid role');

  };

  exports.validateCreateUser = function (data) {
    const rules = {
      name: 'required|min:4|max:64',
      email: 'required|email|min:4|max:64',
      password: 'required|min:4|max:64',
      role: 'required',
      is_admin: 'boolean'
    };
    const validation = new Validator(data, rules);
  
    if (validation.fails()) {
      throw new HTTPError(400, validation.errors.all());
    }
    const hasUpperCase = /[A-Z]/.test(data.password);
    const hasLowerCase = /[a-z]/.test(data.password);
    const hasNumbers = /\d/.test(data.password);
    const hasNonalphas = /\W/.test(data.password);
    const hasTripple = /(.)\1\1/.test(data.password);
  
  
    if (!hasUpperCase && !hasLowerCase) throw new HTTPError(400, 'Password must contain one alphabetic character');
    if (!hasNumbers && !hasNonalphas) throw new HTTPError(400, 'Password must contain one numeric or special character');
    if (hasTripple) throw new HTTPError(400, 'Password must not have consecutive characters');
    if (commonPassword(data.password)) throw new HTTPError(400, 'Password must not be a common or easily guessable password');
  
    const validRoles = ['physician', 'staff'];
    if (!validRoles.includes(data.role)) throw new HTTPError(400, 'Invalid role');
  };

  exports.validateReadAllUsers = function (data) {
    const rules = {
      offset: 'numeric',
      limit: 'numeric',
    };
    const validation = new Validator(data, rules);
  
    if (validation.fails()) {
      throw new HTTPError(400, validation.errors.all());
    }
  };

  
  exports.validateResetPassword = function (data) {
    const rules = {
      new_password: 'required|min:4|max:64',
    };
    const validation = new Validator(data, rules);
  
    const hasUpperCase = /[A-Z]/.test(data.new_password);
    const hasLowerCase = /[a-z]/.test(data.new_password);
    const hasNumbers = /\d/.test(data.new_password);
    const hasNonalphas = /\W/.test(data.new_password);
    const hasTripple = /(.)\1\1/.test(data.new_password);
    if (validation.fails()) {
      throw new HTTPError(400, validation.errors.all());
    }
  
    if (!hasUpperCase && !hasLowerCase) throw new HTTPError(400, 'Password must contain one alphabetic character');
    if (!hasNumbers && !hasNonalphas) throw new HTTPError(400, 'Password must contain one numeric or special character');
    if (hasTripple) throw new HTTPError(400, 'Password must not have consecutive characters');
    if (commonPassword(data.new_password)) throw new HTTPError(400, 'Password must not be a common or easily guessable password');
  };