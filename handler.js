const connectToDatabase = require('./db');

module.exports.healthCheck = async () => {
  try {
    await connectToDatabase();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connection successful.' }),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true },
      body: JSON.stringify({ error: err.message || 'Could not update the Practices.' }),
    };
  }
};
