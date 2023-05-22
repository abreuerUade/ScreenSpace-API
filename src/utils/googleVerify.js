const { OAuth2Client } = require('google-auth-library');
const AppError = require('./appError');

const client = new OAuth2Client(process.env.CLIENT_ID);
async function verify(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();

        return payload;
    } catch (error) {
        return new AppError('Invalid idToken', 400);
    }
}

module.exports = { verify };
