const Owner = require('../models/ownerModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const upload = require('../utils/multerConfig');
const sharp = require('sharp');

const uploadOwnerPhoto = upload.single('photo');

const resizeOwnerPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `owner-${res.locals.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/owners/${req.file.filename}`);

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

    if (req.file) filteredBody.photo = `/images/owners/${req.file.filename}`;

    const owner = await Owner.findByIdAndUpdate(
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
            owner,
        },
    });
});

const deleteMe = catchAsync(async (req, res, next) => {
    const owner = await Owner.findByIdAndDelete(res.locals.user.id);

    res.status(200).json({
        status: 'success',
        data: null,
    });
});

const getOwner = factory.getOne(Owner);

const updateOwner = factory.updateOne(Owner); // Do not update pass

const deleteOwner = factory.deleteOne(Owner);

module.exports = {
    uploadOwnerPhoto,
    resizeOwnerPhoto,
    getMe,
    updateMe,
    deleteMe,
    getOwner,
    updateOwner,
    deleteOwner,
};
