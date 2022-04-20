const request = require('supertest');
const { config } = require('../global');

const server = request(config.server_url);

describe('Validate_Update_User_Calls', () => {

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

    test('Verify if the update is possible using a valid input data', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: config.shortName,
                    password: "Test@123",
                    role: "physician",
                    is_admin: false
                }
            });
        expect(response.statusCode).toBe(200);
        expect(process.env.is_admin).toBe("true");
    });

    test('Verify if the update is possible using an empty input data', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {

                }
            });
        expect(response.statusCode).toBe(200);
        expect(process.env.is_admin).toBe("true");
    });

    test('Verify the limit of characters for username which is not matches with the specified range', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: config.textTooShort
                }
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error.name[0]).toBe("The name must be at least 4 characters.")
        expect(process.env.is_admin).toBe("true");
    });

    test('Verify the maximum limit of characters for username matches with the specified range', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: config.longName
                }
            });
        expect(response.statusCode).toBe(200);
        expect(process.env.is_admin).toBe("true");
    });

    test('Verify if the update is impossible when the userName has more than 64 characters', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: config.textTooLong
                }
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error.name[0]).toBe("The name may not be greater than 64 characters.")
        expect(process.env.is_admin).toBe("true");
    });

    test('Validation for common or easily guessable password', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: "updated_name",
                    password: "A123456"
                }
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must not be a common or easily guessable password")
        expect(process.env.is_admin).toBe("true");
    });

    test('Verify if the update is impossible when the password doesn\'t has alphabetical', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: "updated_name",
                    password: "123456"
                }
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must contain one alphabetic character")
        expect(process.env.is_admin).toBe("true");
    });

    test('Verify if the update is impossible without numeric/special character', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: "updated_name",
                    password: "abcdefg"
                }
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must contain one numeric or special character")
        expect(process.env.is_admin).toBe("true");
    });

    test('Verify if the update is impossible when the user password have consecutive characters', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: "updated_name",
                    password: "Test@1111111"
                }
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Password must not have consecutive characters")
        expect(process.env.is_admin).toBe("true");
    });

    test('Verify if the update is impossible when we are using the invalid roles', async () => {
        const response = await server.put('/users/update/test_userId2')
            .set(config.headers)
            .set('Authorization', process.env.authToken)
            .send({
                user: {
                    name: "updated_name",
                    password: "Test@123",
                    role: "others"
                }
            });
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text).error).toBe("Invalid role")
        expect(process.env.is_admin).toBe("true");
    });

});