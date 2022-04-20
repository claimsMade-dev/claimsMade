const connectToDatabase = require('../../db');
const { HTTPError } = require('../../utils/httpResp');

const destroyTestRecords = async (event) => {
    try {
       
        const input = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const practice_id = input.practice_id;
        const users_email = input.users_email;

        const { Users, PasswordHistory, Op, Practices } = await connectToDatabase();

        await PasswordHistory.destroy({where:{email:{[Op.in]:users_email}}});
        await Users.destroy({where:{email:{[Op.in]:users_email},practice_id}});
        await Practices.destroy({where:{id:practice_id}});

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({status: 'Ok'}),
      };
    } catch (err) {
      return {
        statusCode: err.statusCode || 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ error: err.message || 'Could not update user.' }),
      };
    }
  }
  module.exports.destroyTestRecords = destroyTestRecords;