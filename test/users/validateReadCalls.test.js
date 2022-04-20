
const request = require('supertest');
const { config } = require('../global');

const server = request(config.server_url);

describe('Validate_User_Read_Calls', () => {
  if (!process.env.viaAll) {
    test('login-in a user as not running part of all', async () => {
      const response = await server.post('/login')
      .set('content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: config.testEmail,
        password: 'Test123$'
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.authToken).not.toBe('');
      process.env.authToken = response.body.authToken;
      process.env.is_admin = JSON.parse(response.text).user.is_admin;
    });
  }
  test('read users by physician (no skip, limit, filters, sort)', async () => {
    const response = await server.get('/rest/users')
      .set('content-type', 'application/json')
      .set('Accept', 'application/json')
      .set({
        offset: 1,
        limit: 2,
        sort: "false"
      })
      .set('Authorization', process.env.authToken)
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text).length).toBe(2);
  });

test('read users with skip and limit', async () => {
    const response = await server.get('/rest/users')
      .set('content-type', 'application/json')
      .set('Accept', 'application/json')
      .set({
        offset: 0,
        limit: 4,
        sort: JSON.stringify({column:'Users.name',type:'ASC'})
      })
      .set('Authorization', process.env.authToken)

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text).length).toBe(4);
  });

});
