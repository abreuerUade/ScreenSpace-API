const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movieSchema = new Schema({
    name: String,
    genre: String,
    synopsis: String,
    imageUrl: String,
    premiereDate: Date,
    duration: Number,
    director: String,
    actors: [String],
    avgRating: Number,
});

module.exports = mongoose.model('Movie', movieSchema);
