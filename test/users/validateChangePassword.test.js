const { TestWatcher } = require('jest');
const request = require('supertest');
const { config } = require('../global');

const server = request(config.server_url);

describe('Validate_Change_Password', () => {

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

    test('Verify if able to change the password', async () => {
        const response = await server.post('/users/changePassword')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: "Test@123#"
            })
        expect(response.statusCode).toBe(200);
    });

    test('Verify if the change password action is impossible when the password param is not available', async () => {
        const response = await server.post('/users/changePassword')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({

            })
        expect(response.statusCode).toBe(400)
        expect(JSON.parse(response.text).error.new_password[0]).toBe("The new password field is required.");
    });

    test('Verify the minimum limit of characters for password which is matches with the specified range', async () => {
        const response = await server.post('/users/changePassword')
            .send(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: "123"
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error.new_password[0]).toBe("The new password must be at least 4 characters.");
    });

    test('Verify the maximum limit of characters for password which is matches with the specified range', async () => {
        const response = await server.post('/users/changePassword')
            .send(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: config.textTooLong
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error.new_password[0]).toBe("The new password may not be greater than 64 characters.");
    });

    test('Password validation for alphabetic character', async () => {
        const response = await server.post('/users/changePassword')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: "123456"
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must contain one alphabetic character")
    });

    test('Password validation for consecutive characters', async () => {
        const response = await server.post('/users/changePassword')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: "Test@1111111"
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must not have consecutive characters")
    });

    test('Password validation for numeric or special character', async () => {
        const response = await server.post('/users/changePassword')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: "abcdefg"
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must contain one numeric or special character")
    });

    test('Validation for common or easily guessable password', async () => {
        const response = await server.post('/users/changePassword')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: "A123456"
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must not be a common or easily guessable password")
    });

    test('Verify if the change password action is impossible when we are trying to update the same password', async () => {
        const response = await server.post('/users/changePassword')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: "Test@123#"
            })
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).error).toBe("Can not use any last 6 past password");
    });

    for (let i = 1; i <= 6; i++) {
        test(`Updating password ${i}`, async () => {
            const response = await server.post('/users/changePassword')
                .set(config.headers)
                .set('Authorization', process.env.authToken)
                .send({
                    new_password: `TestPassword@${i}23#`
                })
            expect(response.statusCode).toBe(200);
        });
    }

    test("Verify if the change password action is impossible when we are trying to update the recently updated password", async () => {
        const response = await server.post('/users/changePassword')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                new_password: "TestPassword@123#"
            })
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.text).error).toBe("Can not use any last 6 past password");
    });

});