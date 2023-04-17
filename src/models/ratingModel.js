const mongoose = require('mongoose');

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

module.exports = mongoose.model('Rating', ratingSchema);
