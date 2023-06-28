const Rating = require('../models/ratingModel');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');

const rateMovie = factory.createOne(Rating);

const getMovieRatings = catchAsync(async (req, res, next) => {
    const ratings = await Rating.find({ movie: req.params.id });
    res.status(200).json({
        status: 'success',
        data: {
            ratings,
        },
    });
});

const getUserRatings = catchAsync(async (req, res, next) => {
    const ratings = await Rating.find({ user: req.params.id });
    res.status(200).json({
        status: 'success',
        data: {
            ratings,
        },
    });
});

module.exports = { rateMovie, getMovieRatings, getUserRatings };
