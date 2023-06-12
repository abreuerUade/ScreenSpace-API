const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Showtime = require('../models/showtimeModel');
const Movie = require('../models/movieModel');
const AppError = require('../utils/appError');

const createShowtime = catchAsync(async (req, res, next) => {
    req.body = { ...req.body, owner: res.locals.user.id };

    const movie = await Movie.findById(req.body.movie);

    if (Date.parse(req.body.startTime) < Date.parse(movie.premiereDate)) {
        next(
            new AppError('The showtime cannot be before the premiere date', 400)
        );
    }

    const newShowtime = await Showtime.create(req.body);

    const showtime = await Showtime.findById(newShowtime._id).populate('movie');

    res.status(201).json({
        status: 'success',
        data: {
            showtime,
        },
    });
});

const getShowtime = factory.getOne(Showtime, ['theater', 'movie', 'cinema']);

const getAllShowtimes = factory.getAll(Showtime, [
    'theater',
    'movie',
    'cinema',
]);

const updateShowtime = factory.updateOne(Showtime);

const deleteShowtime = factory.deleteOne(Showtime);

const cinemaMovieShowtimes = catchAsync(async (req, res, next) => {
    const showtimes = await Showtime.find({
        cinema: req.params.cinemaId,
        movie: req.params.movieId,
    })
        .populate('movie')
        .populate('theater');

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: {
            showtimes,
        },
    });
});

const getShowtimesByTheater = catchAsync(async (req, res, next) => {
    const showtimes = await Showtime.find({
        theater: req.params.id,
    }).populate('movie');

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: {
            showtimes,
        },
    });
});

module.exports = {
    createShowtime,
    getShowtime,
    getAllShowtimes,
    updateShowtime,
    deleteShowtime,
    cinemaMovieShowtimes,
    getShowtimesByTheater,
};
