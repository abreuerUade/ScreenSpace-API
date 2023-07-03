const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Showtime = require('../models/showtimeModel');
const Movie = require('../models/movieModel');
const AppError = require('../utils/appError');
const Theater = require('../models/theaterModel');
const APIFeatures = require('../utils/apiFeatures');

const createShowtime = catchAsync(async (req, res, next) => {
    const movie = await Movie.findById(req.body.movie);

    if (Date.parse(req.body.startTime) < Date.parse(movie.premiereDate)) {
        next(
            new AppError('The showtime cannot be before the premiere date', 400)
        );
    }
    if (Date.parse(req.body.startTime) < Date.parse(new Date())) {
        next(new AppError('The showtime cannot be before today', 400));
    }

    // const finishTime = new Date(
    //     new Date(this.startTime).setMinutes(
    //         this.startTime.getMinutes() + this.movie.duration + 30
    //     )
    // );

    // let showtimes = await Showtime.find({ theater: req.body.theater });

    // showtimes = showtimes.filter(item => {
    //     return item.startTime.getDay() === req.body.startTime.getDay();
    // });

    // showtimes.forEach(item => {
    //     if (
    //         req.body.startTime.getTime() >= item.startTime.getTime() &&
    //         req.body.startTime.getTime() <= item.finishTime.getTime()
    //     ) {
    //         next(new AppError('The showtime is overlapped', 400));
    //     }
    // });

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

// const getAllShowtimes = catchAsync(async (req, res, next) => {
//     let query = Showtime.find()
//         .populate('movie')
//         .populate('theater')
//         .populate('cinema');

//     const features = new APIFeatures(query, req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();

//     if (req.query.startTime) {
//         const startTime = new Date(req.query.startTime);
//         const finishTime = new Date(
//             new Date(startTime).setMinutes(startTime.getMinutes() + 24 * 60)
//         );

//         console.log(startTime, finishTime);
//         features.query = features.query.find({
//             startTime: {
//                 $gte: startTime,
//                 $lte: finishTime,
//             },
//         });
//     }

//     const doc = await features.query;

//     res.status(200).json({
//         status: 'success',
//         results: doc.length,
//         data: {
//             doc,
//         },
//     });
// });

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
