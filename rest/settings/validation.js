const Validator = require('validatorjs');
const { HTTPError } = require('../../utils/httpResp');


exports.validateInputData = function (data) {
    const rules = {
        session_timeout: 'numeric'
    };
    const validation = new Validator(data, rules);
    if(validation.fails()) throw new HTTPError(400, validation.errors.all());
}