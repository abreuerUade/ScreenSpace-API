const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movieSchema = new Schema(
    {
        name: String,
        genre: String,
        synopsis: String,
        imageUrl: String,
        premiereDate: Date,
        duration: Number,
        director: String,
        actors: [String],
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

movieSchema.virtual('ratings', {
    ref: 'Rating',
    foreignField: 'movie',
    localField: '_id',
});

module.exports = mongoose.model('Movie', movieSchema);
