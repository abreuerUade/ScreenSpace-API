const { get } = require('lodash');
const { verifyJwt } = require('../utils/jwt.utils');
const { refreshAccessToken } = require('../service/sessionService');
const catchAsync = require('../utils/catchAsync');

const deserializeUser = catchAsync(async (req, res, next) => {
    const accessToken =
        get(req, 'cookies.accessToken') ||
        get(req, 'headers.authorization', '').replace(/^Bearer\s/, '');

    const refreshToken =
        get(req, 'cookies.refreshToken') || get(req, 'headers.x-refresh');

    const { decoded, expired } = verifyJwt(accessToken);

    if (decoded) {
        res.locals.user = decoded;
        return next();
    }

    if (expired && refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);

        if (newAccessToken) {
            res.setHeader('x-access-token', newAccessToken);

            // res.cookie("accessToken", newAccessToken, {
            //   maxAge: 60000, //15 min
            //   httpOnly: true,
            //   domain: "localhost",
            //   path: "/",
            //   sameSite: "strict",
            //   secure: false,
            // });
        }

        const result = verifyJwt(newAccessToken);

        res.locals.user = result.decoded;

        return next();
    }

    return next();
});

module.exports = deserializeUser;
