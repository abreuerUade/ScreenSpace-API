const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { signJwt } = require('../utils/jwt.utils');
const Owner = require('../models/ownerModel');
const Session = require('../models/sessionModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const { validatePassword } = require('../service/ownerService');

const signup = catchAsync(async (req, res, next) => {
    const ownerExists = await Owner.findOne({ email: req.body.email });

    if (ownerExists) {
        return next(new AppError('User alredy exists', 401));
    }

    const newOwner = await Owner.create({
        email: req.body.email,
        password: req.body.password,
    });
    // Create hashed token
    const token = await newOwner.createEmailToken();
    await newOwner.save({ validateBeforeSave: false });

    // Send confirm mail
    const confirmURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/owners/confirmedEmail/${token}`;

    await new Email(newOwner, confirmURL).sendVerifyEmail();

    res.status(200).json({
        status: 'success',
        message: 'Confirmation sent to email!',
    });
});

const verifyEmail = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const owner = await Owner.findOne({
        emailToken: hashedToken,
    });

    if (!owner) {
        return next(new AppError('Token is invalid', 400));
    }

    if (owner.emailTokenExpires < Date.now()) {
        await Owner.findByIdAndDelete(owner._id);
        return next(new AppError('Token has expired', 400));
    }

    owner.isVerified = true;
    owner.emailToken = undefined;
    owner.emailTokenExpires = undefined;
    await owner.save();

    res.status(200).render('accountCreated');
});

const login = catchAsync(async (req, res, next) => {
    let owner = await validatePassword(req.body.email, req.body.password);
    if (!owner || !owner.isVerified) {
        return next(new AppError('Invalid email or password', 400));
    }

    const session = await Session.create({
        user: owner._id,
        userAgent: req.get('user-agent') || '',
        userModel: 'Owner',
    });

    // create token

    const accessToken = signJwt(
        {
            id: owner._id,
            email: owner.email,
            password: owner.password,
            role: owner.role,
            session: session._id,
        },
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES,
        }
    );

    // create refresh
    const refreshToken = signJwt(
        { ...owner, session: session._id },
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES,
        }
    );

    res.status(200).json({
        status: 'success',
        data: { owner, accessToken, refreshToken },
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

const forgotPassword = catchAsync(async (req, res, next) => {
    // get Owner on poster email
    const owner = await Owner.findOne({ email: req.body.email }).select(
        '+password'
    );

    if (!owner) {
        return next(new AppError('There is no owner with thar email', 404));
    }

    // Generate random new password and update user
    const tempPassword = crypto.randomBytes(8).toString('hex');
    // generate token

    owner.password = tempPassword;
    await owner.save({ validateBeforeSave: false });

    try {
        await new Email(owner, tempPassword).sendResetPassword();
    } catch (error) {
        owner.emailToken = undefined;
        owner.emailTokenExpires = undefined;
        await owner.save({ validateBeforeSave: false });
        return next(new AppError('Error with email', 500));
    }

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
    });
});

const updatePassword = catchAsync(async (req, res, next) => {
    const owner = await Owner.findOne({ email: req.body.email }).select(
        '+password'
    );

    if (!(await bcrypt.compare(req.body.currentPassword, owner.password))) {
        return next(new AppError('Incorrect email or pass', 401));
    }
    owner.password = req.body.newPassword;
    await owner.save();

    res.status(200).json({
        status: 'success',
        message: 'Password Updated',
    });
});

module.exports = {
    verifyEmail,
    signup,
    login,
    logout,
    forgotPassword,
    updatePassword,
};
