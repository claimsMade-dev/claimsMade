const request = require('supertest');
const { config } = require('../global');

const server = request(config.server_url);

describe('Delete', () => {
    if (!process.env.viaAll) {
        test('Login', async () => {
            const response = await server.post('/login')
                .set(config.headers)
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

    test('Verify if the user is able to delete or not', async () => {
        const response = await server.delete('/users/destroy/test_userId2')
        .set(config.headers)
        .set('Authorization', process.env.authToken)
        .send({

        });
        expect(response.statusCode).toBe(200);
        expect(process.env.is_admin).toBe("true");        
    });
});