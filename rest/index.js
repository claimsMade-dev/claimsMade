const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const healthCheckApi = require('../handler');
const authMiddleware = require('../authExpress');
const usersApi = require('./users/controller');
const removeTestDatas = require('./remove_test_datas/controller');
const app = express();
app.use(bodyParser.json({ strict: false }));

app.use(cors());
app.options('*', cors());

app.get('/rest/', authMiddleware, async (req, res) => {
  try {
    const responseData = await healthCheckApi.healthCheck(req);
    return res
    .status(responseData.statusCode)
    .json(JSON.parse(responseData.body));
  } catch (err) {
    return res
        .status(err.statusCode || 500)
        .json({ error: err.message });
  }
});

app.get('/rest/users', authMiddleware, async (req, res) => {
    try {
      const responseData = await usersApi.getAll(req);
      return res
      .status(responseData.statusCode).header(responseData.headers)
      .json(JSON.parse(responseData.body));
    } catch (err) {
      return res
          .status(err.statusCode || 500)
          .json({ error: err.message });
    }
  });

app.post('/rest/users/session', async (req, res) => {
    try {
      const responseData = await usersApi.sessionTokenGenerate(req);
      return res
                .status(responseData.statusCode)
                .json(JSON.parse(responseData.body));
    } catch (err) {
      return res
                    .status(err.statusCode || 500)
                    .json({ error: err.message });
    }
  });

app.delete('/rest/users/removeTestRecords', authMiddleware, async (req, res) => {
    try {
      const responseData = await removeTestDatas.destroyTestRecords(req);
      return res
      .status(responseData.statusCode)
      .json(JSON.parse(responseData.body));
    } catch (err) {
      return res
          .status(err.statusCode || 500)
          .json({ error: err.message });
    }
  });

module.exports.handler = serverless(app);
