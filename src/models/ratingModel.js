const mongoose = require('mongoose');
const Movie = require('./movieModel');
const AppError = require('../utils/appError');

const Schema = mongoose.Schema;

const ratingSchema = new Schema(
    {
        rating: {
            type: Number,
            min: 0,
            max: 5,
            require: true,
        },
        comment: {
            type: String,

            require: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true,
        },
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            require: true,
        },
        date: {
            type: Date,
            default: new Date(),
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

ratingSchema.index({ user: 1, movie: 1 }, { unique: true });

ratingSchema.statics.calcAverageRatings = async function (movieId) {
    const stats = await this.aggregate([
        {
            $match: { movie: movieId },
        },
        {
            $group: {
                _id: '$movie',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    await Movie.findByIdAndUpdate(movieId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating,
    });
};

ratingSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.movie);
});

ratingSchema.post(/^findOneAnd/, async function (doc, next) {
    if (!doc) {
        return next(new AppError('No doc found with that id', 404));
    }
    await doc.constructor.calcAverageRatings(doc.movie);
});

module.exports = mongoose.model('Rating', ratingSchema);
