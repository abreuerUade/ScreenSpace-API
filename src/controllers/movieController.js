const factory = require('../controllers/handlerFactory');
const Movie = require('../models/movieModel');
const Showtime = require('../models/showtimeModel');
const catchAsync = require('../utils/catchAsync');

const getAllMovies = factory.getAll(Movie);

const getOneMovie = factory.getOne(Movie);

const getMovieByCinema = catchAsync(async (req, res, next) => {
    const showtimes = await Showtime.find({
        cinema: req.params.cinemaId,
    }).populate('movie');

    const movies = showtimes.map(item => item.movie);

    res.status(200).json({
        status: 'success',
        results: movies.length,
        data: movies,
    });
});

module.exports = { getAllMovies, getOneMovie, getMovieByCinema };
