const { signJwt } = require('../utils/jwt.utils');
const Session = require('../models/sessionModel');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const { verify } = require('../utils/googleVerify');

const login = catchAsync(async (req, res, next) => {
    //Google verivication
    const payload = await verify(req.body.idToken);

    // let user = await User.findOne({ googleId: payload['sub'] });
    // if (!user) user = await User.create(req.body);

    // const session = await Session.create({
    //     user: user._id,
    //     userAgent: req.get('user-agent') || '',
    //     userModel: 'User',
    // });

    // // create token

    // const accessToken = signJwt(
    //     {
    //         id: user._id,
    //         email: user.email,
    //         role: user.role,
    //         session: session._id,
    //     },
    //     {
    //         expiresIn: process.env.JWT_ACCESS_EXPIRES,
    //     }
    // );

    // // create refresh
    // const refreshToken = signJwt(
    //     { ...user, session: session._id },
    //     {
    //         expiresIn: process.env.JWT_REFRESH_EXPIRES,
    //     }
    // );

    // res.status(200).json({
    //     status: 'Success',
    //     data: { user, accessToken, refreshToken },
    // });
    res.status(200).json({
        status: 'Success',
        data: { payload },
    });
});

const logout = catchAsync(async (req, res) => {
    const sessionId = res.locals.user.session;

    await Session.findOneAndUpdate({ _id: sessionId }, { valid: false });

    return res.send({
        status: 'success',
        accessToken: null,
        refreshToken: null,
    });
});

module.exports = {
    login,
    logout,
};
