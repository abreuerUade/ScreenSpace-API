const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Showtime = require('../models/showtimeModel');
const Movie = require('../models/movieModel');
const AppError = require('../utils/appError');
const Theater = require('../models/theaterModel');

const createShowtime = catchAsync(async (req, res, next) => {
    const movie = await Movie.findById(req.body.movie);

    if (Date.parse(req.body.startTime) < Date.parse(movie.premiereDate)) {
        next(
            new AppError('The showtime cannot be before the premiere date', 400)
        );
    }

    const newDoc = await Showtime.create(req.body);

    if (!newDoc) {
        return next(new AppError('Cannot create showtime', 400));
    }

    const theater = await Theater.findById(req.body.theater);

    if (!theater) {
        return next(new AppError('No theater found with that ID', 404));
    }

    const rows = theater.numberOfRows;
    const cols = theater.numberOfCols;
    newDoc.cinema = theater.cinema;

    newDoc.availableSeatsLeft = rows * cols;
    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            newDoc.seats.push({ row: r, column: c, taken: false });
        }
    }
    await newDoc.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: newDoc,
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
