const Cinema = require('../models/cinemaModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const upload = require('../utils/multerConfig');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const Theater = require('../models/theaterModel');
const Showtime = require('../models/showtimeModel');
const Owner = require('../models/ownerModel');

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
    const cinemas = await Cinema.find({ owner: req.params.ownerId });
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

const postCinema = catchAsync(async (req, res, next) => {
    req.body = { ...req.body, owner: res.locals.user.id };

    if (req.file) req.body.photo = `/images/cinemas/${req.file.filename}`;

    const newDoc = await Cinema.create(req.body);

    const owner = await Owner.findById(res.locals.user.id);

    const newCinemas = [...owner.cinemas, newDoc.id];

    owner.cinemas = newCinemas;
    await owner.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: newDoc,
    });
});

const updateCinema = factory.updateOne(Cinema);

const deleteCinema = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
        return next(new AppError('No cinema found with that ID', 404));
    }

    await Owner.findByIdAndUpdate(res.locals.user.id, {
        $pull: { cinemas: req.params.id },
    });

    await Cinema.findByIdAndDelete(req.params.id);

    res.status(200).json({
        status: 'success',
        data: null,
    });
});

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
