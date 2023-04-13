const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Theater = require('../models/theaterModel');
const Cinema = require('../models/cinemaModel');

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

const createTheater = factory.createOne(Theater);

const getTheater = factory.getOne(Theater);

const updateTheater = factory.updateOne(Theater);

const deleteTheater = factory.deleteOne(Theater);

module.exports = {
    createTheater,
    getTheater,
    updateTheater,
    deleteTheater,
    getCinemaTheaters,
};
