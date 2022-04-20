
const request = require('supertest');
const { config } = require('../global');
const { QueryTypes } = require('sequelize');


const server = request(config.server_url);

describe('Clean Up Test records', () => {

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

  // test('verify if the test records are deleted', async () => {
  //   const { Users, Practices } = await connectToDatabase();

  //   const result = await Users.destroy({ where: {practice_id: config.practice_id } });
  //   const result1 = await Practices.destroy({ where: {id: config.practice_id } });

  //   expect(result).not.toBe(null);
  //   expect(result1).not.toBe(null);

  //   const count = await Practices.count({
  //     where: {id: config.practice_id
  //     },
  //   });
  //   expect(count).toBe(0);
  // });


  test('verify if the test records are deleted', async () => {
    const response = await server.delete('/rest/users/removeTestRecords')
    .set(config.headers)
    .set('Authorization', process.env.authToken)
    .send({
        practice_id: config.practice_id,
        users_email: config.users_test_email
    });
    console.log("Delete API response" + JSON.stringify(response));
    expect(response.statusCode).toBe(200);
    //expect(process.env.is_admin).toBe("true");        
});

});
