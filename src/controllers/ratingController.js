const Rating = require('../models/ratingModel');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');

const rateMovie = factory.createOne(Rating);

const getMovieRatings = catchAsync(async (req, res, next) => {});

module.exports = { rateMovie, getMovieRatings };
