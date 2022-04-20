const connectToDatabase = require('../../db');
const authMiddleware = require('../../auth');
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop');
const middy = require('@middy/core');
const uuid = require('uuid');
const { validateInputData } = require('./validation');

const getSettings = async (event) => {
    try {
        const { Settings } = await connectToDatabase();
        let settings;
        const settingsObj = await Settings.findOne({
            where: { key: 'global_settings' }
        });
        if (settingsObj) {
            settings = JSON.parse(settingsObj.value);
        } else {
            settings = {}
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(settings)
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ error: error.message || "Could not fetch the practices" })
        }
    }
}

const setSettings = async (event) => {
    try {
        const input = JSON.parse(event.body);
        validateInputData(input);
        const { Settings } = await connectToDatabase();
        const settingsObj = await Settings.findOne({
            where: { key: 'global_settings' }
        });
        if (settingsObj) {
            settingsObj.value = JSON.stringify(input);
            await settingsObj.save();
        } else {
            const newSettingsObj = Object.assign({
                key: 'global_settings',
                value: JSON.stringify(input)
            }, { id: uuid.v4() });
            await Settings.create(newSettingsObj);
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(input)
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ error: error.message || "Could not fetch the practices" })
        }
    }
}

module.exports.setSettings = middy(setSettings).use(authMiddleware()).use(doNotWaitForEmptyEventLoop());
module.exports.getSettings = middy(getSettings).use(authMiddleware()).use(doNotWaitForEmptyEventLoop());