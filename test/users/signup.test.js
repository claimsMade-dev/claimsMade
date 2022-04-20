

const request = require('supertest');
const { config } = require('../global');

const server = request(config.server_url);

describe('SignUp', () => {
  // test('Clean Up User Table', async () => {
  //   const { Users, sequelize } = await connectToDatabase();

  //   const result = await Users.destroy({ where: { } });

  //   expect(result).not.toBe(null);
  //   const count = await Users.count({
  //     where: {
  //     },
  //   });
  //   // sequelize.close();
  //   expect(count).toBe(0);
  // });

  test('Status code and authToken validation', async () => {
    const response = await server.post('/users/signup')
    .set('content-type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      practice_name: 'Test Practice',
      name: 'Test user',
      email: config.testEmail,
      password: 'Test123$',
      role: 'physician',
      practice_id: config.practice_id,
      user_id: config.test_user_ids[0]
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text).authToken).not.toBe('');
  });

  test('Password validation for alphabetic character', async () => {
    const response = await server.post('/users/signup')
    .set('content-type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      practice_name: 'Test Practice',
      name: 'Test user',
      email: config.testEmail,
      password: '123$',
      role: 'physician',
      practice_id: config.practice_id,
      user_id: config.test_user_ids[0]
    });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.text).error).toBe("Password must contain one alphabetic character");
  });

  test('Password validation for numeric or special character', async () => {
    const response = await server.post('/users/signup')
    .set('content-type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      practice_name: 'Test Practice',
      name: 'Test user',
      email: config.testEmail,
      password: 'Test',
      role: 'physician',
      practice_id: config.practice_id,
      user_id: config.test_user_ids[0]
    });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.text).error).toBe("Password must contain one numeric or special character");
  });

  test('Password validation for consecutive characters', async () => {
    const response = await server.post('/users/signup')
    .set('content-type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      practice_name: 'Test Practice',
      name: 'Test user',
      email: config.testEmail,
      password: 'TTTest1$',
      role: 'physician',
      practice_id: config.practice_id,
      user_id: config.test_user_ids[0]
    });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.text).error).toBe("Password must not have consecutive characters");
  });

});
