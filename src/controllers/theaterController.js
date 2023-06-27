const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Theater = require('../models/theaterModel');
const Cinema = require('../models/cinemaModel');
const Showtime = require('../models/showtimeModel');
const AppError = require('../utils/appError');

const getCinemaTheaters = catchAsync(async (req, res, next) => {
    const cinema = await Cinema.findById(req.params.id).populate({
        path: 'theaters',
    });
    const theaters = cinema.theaters;

    res.status(200).json({
        status: 'success',
        results: theaters.length,
        data: {
            theaters,
        },
    });
});

const createTheater = catchAsync(async (req, res, next) => {
    const newDoc = await Theater.create(req.body);

    const cinema = await Cinema.findById(req.body.cinema);

    const theaters = [...cinema.theaters, newDoc.id];

    cinema.theaters = theaters;
    cinema.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: newDoc,
    });
});

const getTheater = factory.getOne(Theater);

const updateTheater = factory.updateOne(Theater);

const deleteTheater = catchAsync(async (req, res, next) => {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
        return next(new AppError('No theater found with that ID', 404));
    }

    await Cinema.findByIdAndUpdate(theater.cinema, {
        $pull: { theaters: req.params.id },
    });

    await Theater.findByIdAndDelete(req.params.id);
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    createTheater,
    getTheater,
    updateTheater,
    deleteTheater,
    getCinemaTheaters,
};
