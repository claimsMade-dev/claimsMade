

// invalidPostData, invalidParams, and serverError takes customer error messages/data
// rest of the functions add relevant data by itself


const HTTPError = function (statusCode, message) {
  const error = {
    message,
  };
  error.statusCode = statusCode;
  return error;
};

exports.HTTPError = HTTPError;

// when url is not valid/known
exports.resInvalidURL = function () {
  throw new HTTPError(404, 'not found (invalid url)');
};

// when resource is not valid/known
exports.resInvalidResourceId = function (req, res) {
  throw new HTTPError(400, 'not found (invalid resource-id)');
};

// for invalid method type on known urls (e.g. POST call on /:id)
exports.resInvalidMethod = function () {
  throw new HTTPError(400, 'bad request (invalid http method)');
};

// for any calls other that POST, GET, PUT, DELETE
exports.resUnsupportedMethod = function () {
  throw new HTTPError(400, 'bad request (unsupported http method)');
};

// for validation failure of post-data (for post and put calls) - with speicfic failure info
exports.resInvalidPostDataWithInfo = function () {
  throw new HTTPError(400, 'bad request (invalid post-data)');
};

// for validation failure of post-data (for post and put calls) - without specific failure info
exports.resInvalidPostData = function () {
  throw new HTTPError(400, 'bad request (invalid post-data)');
};

// for validation failure of params
exports.resInvalidParamsWithInfo = function () {
  throw new HTTPError(400, 'bad request (invalid url params');
};

// for validation failure of params
exports.resInvalidParams = function () {
  throw new HTTPError(400, 'bad request (invalid url params)');
};

// note: for unauthenticated access (not for unauthorized as name suggests) - named so to match http convention
// use forbidden for authenticated, but unauthorized condition
exports.resUnauthorizedWithInfo = function () {
  throw new HTTPError(400, 'unauthorized (unauthenticated access)');
};

// for authenticated, but unauthorized requests
exports.resForbidden = function () {
  throw new HTTPError(403, 'forbidden (authenticated, but unauthorized request)');
};

// for errors where nothing is wrong with the request
exports.resServerError = function () {
  throw new HTTPError(500, 'server error');
};

// for errors where nothing is wrong with the request
exports.resServerErrorWithInfo = function () {
  throw new HTTPError(500, 'server error');
};

// for success response
exports.resSuccess = function (data) {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

