const Cinema = require('../models/cinemaModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const upload = require('../utils/multerConfig');
const sharp = require('sharp');
const AppError = require('../utils/appError');

const uploadCinemaPhoto = upload.single('photo');

const resizeCinemaPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `cinema-${res.locals.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/cinemas/${req.file.filename}`);

    next();
});

const getOwnerCinemas = catchAsync(async (req, res, next) => {
    if (res.locals.user.id != req.params.ownerId) {
        return next(
            new AppError('You are not allowed to get these cinemas', 403)
        );
    }
    const cinemas = await Cinema.find({ ownerId: req.params.ownerId });
    res.status(200).json({
        status: 'success',
        results: cinemas.length,
        cinemas,
    });
});

const getCinemasInRadius = catchAsync(async (req, res, next) => {
    const { distance, latlng } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitud and longitude in the format lat,lng.',
                400
            )
        );
    }

    const radius = distance / 6378.1;

    const cinemas = await Cinema.find({
        location: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] },
        },
    });

    res.status(200).json({
        status: 'success',
        results: cinemas.length,
        cinemas,
    });
});

const getAllCinemas = factory.getAll(Cinema);

const getCinema = factory.getOne(Cinema);
// const getCinema = factory.getOne(Cinema, { path: 'theaters' });

const postCinema = factory.createOne(Cinema);

const updateCinema = factory.updateOne(Cinema);

const deleteCinema = factory.deleteOne(Cinema);

module.exports = {
    uploadCinemaPhoto,
    resizeCinemaPhoto,
    getAllCinemas,
    getCinema,
    getOwnerCinemas,
    getCinemasInRadius,
    postCinema,
    updateCinema,
    deleteCinema,
};
