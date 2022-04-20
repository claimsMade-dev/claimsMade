const Validator = require('validatorjs');
const { HTTPError } = require('../../utils/httpResp');

exports.validateLogin = function (data) {
  const rules = {
    email: 'required|email',
    password: 'required|min:4|max:32',
  };
  const validation = new Validator(data, rules);

  if (validation.fails()) {
    throw new HTTPError(400, validation.errors.all());
  }
};
exports.validateotp = (data)=>{
  const rules = {
    email: 'required|email',
    otp: 'required',
  };
  const validation = new Validator(data, rules);

  if (validation.fails()) {
    throw new HTTPError(400, validation.errors.all());
  }
}

