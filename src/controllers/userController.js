const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const upload = require('../utils/multerConfig');
const sharp = require('sharp');

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${res.locals.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...fields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (fields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

const getMe = (req, res, next) => {
    req.params.id = res.locals.user.id;
    next();
};

const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updatePassword',
                400
            )
        );
    }

    const filteredBody = filterObj(req.body, 'name', 'email');

    if (req.file) filteredBody.photo = `/images/users/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
        res.locals.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

const deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(res.locals.user.id);

    res.status(200).json({
        status: 'success',
        data: null,
    });
});

const getUser = factory.getOne(User);

const updateUser = factory.updateOne(User); // Do not update pass

const deleteUser = factory.deleteOne(User);

module.exports = {
    uploadUserPhoto,
    resizeUserPhoto,
    getMe,
    updateMe,
    deleteMe,
    getUser,
    updateUser,
    deleteUser,
};
