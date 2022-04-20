const request = require('supertest');
const { config } = require('../global');
const EnvVariables = require('../../configs/secrets.test.json');

process.env = Object.assign(process.env, EnvVariables);

const server = request(config.server_url);

describe('Login', () => {
    test('Verify if the login is possible with a valid email & password', async () => {
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

    test('Verify if the login is impossible without a email field', async () => {
        const response = await server.post('/login')
            .send(config.headers)
            .send({
                password: "Test123$"
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error.email[0]).toBe("The email field is required.");
    });

    test('Verify if the login is impossible without a password field', async () => {
        const response = await server.post('/login')
            .send(config.headers)
            .send({
                email: config.testEmail
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error.password[0]).toBe("The password field is required.");
    });

    test('Verify the limit of characters for password matches with the specified range', async () => {
        const response = await server.post('/login')
            .send(config.headers)
            .send({
                email: config.testEmail,
                password: "123"
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error.password[0]).toBe("The password must be at least 4 characters.");
    });

    test('Verify if the login is impossible with a wrong email format', async () => {
        const response = await server.post('/login')
            .send(config.headers)
            .send({
                email: "test.com",
                password: "Test123$"
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error.email[0]).toEqual("The email format is invalid.")
    });

    test('Verify if the login is impossible with a wrong email', async () => {
        const response = await server.post('/login')
            .set(config.headers)
            .send({
                email: "test@gmail.com",
                password: "Test123$"
            });
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.text).error).toBe("Couldn't find your account");
    });

    test('Verify if the login is possible with a wrong password', async () => {
        const response = await server.post('/login')
            .set(config.headers)
            .send({
                email: config.testEmail,
                password: "123123"
            });
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).error).toBe("Wrong password. Try again or click Forgot password to reset it");
    });

});