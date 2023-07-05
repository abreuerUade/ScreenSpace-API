const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Showtime = require('../models/showtimeModel');
const Movie = require('../models/movieModel');
const AppError = require('../utils/appError');
const Theater = require('../models/theaterModel');
const APIFeatures = require('../utils/apiFeatures');

const createShowtime = catchAsync(async (req, res, next) => {
    const movie = await Movie.findById(req.body.movie);

    if (
        new Date(req.body.startTime).getTime() <
        new Date(movie.premiereDate).getTime()
    ) {
        return next(
            new AppError('The showtime cannot be before the premiere date', 400)
        );
    }
    if (
        new Date(req.body.startTime).getTime() <
        new Date().setHours(new Date().getHours() - 3)
    ) {
        return next(new AppError('The showtime cannot be before today', 400));
    }

    const DURATION = movie.duration * 60 * 1000; // hours*minutes*seconds*milliseconds
    const CLEANING_TIME = 30 * 60 * 1000;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const showtimeDate = new Date(
        `${new Date(req.body.startTime).getFullYear()}-${
            new Date(req.body.startTime).getMonth() + 1
        }-${new Date(req.body.startTime).getDate()}Z`
    );

    const showtimeDateEnd = new Date(showtimeDate.getTime() + ONE_DAY);
    const startTime = new Date(req.body.startTime);
    const finishTime = new Date(startTime.getTime() + DURATION + CLEANING_TIME);

    const showtimes = await Showtime.find({
        theater: req.body.theater,
        startTime: {
            $gte: showtimeDate,
            $lte: showtimeDateEnd,
        },
    });

    let avilable = true;

    showtimes.forEach(item => {
        // console.log(startTime, finishTime, item.startTime, item);
        if (
            !(
                (startTime.getTime() < item.startTime.getTime() &&
                    finishTime.getTime() < item.startTime.getTime()) ||
                startTime.getTime() > new Date(item.finishTime).getTime()
            )
        ) {
            return (avilable = false);
        }
    });

    if (!avilable) {
        return next(new AppError('The showtime is not available', 400));
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
    newDoc.seats = [];
    newDoc.cinema = theater.cinema;

    newDoc.availableSeatsLeft = rows * cols;
    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            newDoc.seats.push({ row: r, column: c, taken: false });
        }
    }
    await newDoc.save({ validateBeforeSave: false });

    res.status(201).json({
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

const updateShowtime = catchAsync(async (req, res, next) => {
    const doc = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })
        .populate('movie')
        .populate('theater')
        .populate('cinema');

    if (!doc) {
        return next(new AppError('No doc found with that id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            doc,
        },
    });
});

const deleteShowtime = factory.deleteOne(Showtime);

const cinemaMovieShowtimess = catchAsync(async (req, res, next) => {
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

const getShowtimesForMovie = catchAsync(async (req, res, next) => {
    const { movie, latlng } = req.query;
    const [lng, lat] = latlng.split(',');
    const multiplier = 0.001;

    if (!lat || !lng || !movie) {
        next(
            new AppError('Please provide latitutd, longitude and movie.', 400)
        );
    }

    const showtimes = await Showtime.find({ movie })
        .populate('cinema')
        .aggregate([{}]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    });
});

module.exports = {
    createShowtime,
    getShowtime,
    getAllShowtimes,
    updateShowtime,
    deleteShowtime,
    getShowtimesByTheater,
    getShowtimesForMovie,
};
