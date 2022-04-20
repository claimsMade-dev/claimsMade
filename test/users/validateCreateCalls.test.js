
const request = require('supertest');
const { config } = require('../global');

const server = request(config.server_url);

describe('Validate_User_Create_Calls', () => {
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
      expect(JSON.parse(response.text).authToken).not.toBe('');
      process.env.authToken = JSON.parse(response.text).authToken;
      process.env.is_admin = JSON.parse(response.text).user.is_admin;
    });
  }


  test('create user with all fields for test', async () => {
    const response = await server.post('/users')
      .set('content-type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', process.env.authToken)
      .send({
        id: config.test_user_ids[1],
        name: 'Second user',
        email: 'secondtestuser@test.com',
        password: 'Test123$',
        role: 'physician',
        is_admin: true
      });
    expect(response.statusCode).toBe(200);
    expect(process.env.is_admin).toBe("true");
  });

  test('create user with only required fields (username, password, role, name)', async () => {
    const response = await server.post('/users')
      .set('content-type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', process.env.authToken)
      .send({
        id: '',
        name: 'Third User',
        email: 'thirdtestuser@test.com',
        password: 'Test123$',
        role: 'physician',
        is_admin: true
      });
    expect(response.statusCode).toBe(200);
    expect(process.env.is_admin).toBe("true");
  });

  test('create test user with all fields at min value/length', async () => {
    const response = await server.post('/users')
      .set('content-type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', process.env.authToken)
      .send({
        id: config.test_user_ids[2],
        name: config.shortName,
        email: config.shortEmail,
        password: config.text4,
        role: 'physician',
        is_admin: true
      });
    expect(response.statusCode).toBe(200);
    expect(process.env.is_admin).toBe("true");
  });

    test('create 5th user with all fields at max value/length', async () => {
      const response = await server.post('/users')
        .set('content-type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', process.env.authToken)
        .send({
          id: config.test_user_ids[3],
          name: config.longName,
          email: config.longEmail,
          password: config.text64,
          role: 'physician',
          is_admin: true
        });
      expect(response.statusCode).toBe(200);
      expect(process.env.is_admin).toBe("true");
    });

    test('Password validation for numeric or special character', async () => {
      const response = await server.post('/users')
        .set('content-type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', process.env.authToken)
        .send({
          id: config.test_user_ids[4],
          name: 'Required User',
          email: 'req_fields_user1265@email.com',
          password: 'Test',
          role: 'physician',
          is_admin: true
        });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must contain one numeric or special character");
    });

    test('Password validation for alphabetic character', async () => {
      const response = await server.post('/users')
        .set('content-type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', process.env.authToken)
        .send({
          id: config.test_user_ids[4],
          name: 'Required User',
          email: 'req_fields_user1265@email.com',
          password: '123$',
          role: 'physician',
          is_admin: true
        });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must contain one alphabetic character");
    });

    test('Password validation for consecutive characters', async () => {
      const response = await server.post('/users')
        .set('content-type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', process.env.authToken)
        .send({
          id: config.test_user_ids[4],
          name: 'Required User',
          email: 'req_fields_user1265@email.com',
          password: 'TTTest1$',
          role: 'physician',
          is_admin: true
        });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must not have consecutive characters");
    });

    test('Validation for role', async () => {
      const response = await server.post('/users')
        .set('content-type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', process.env.authToken)
        .send({
          id: config.test_user_ids[4],
          name: 'Required User',
          email: 'req_fields_user1265@email.com',
          password: 'Test123$',
          role: 'patient',
          is_admin: true
        });
        console.log("response=>" + JSON.stringify(response));
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Invalid role");
    });

});
