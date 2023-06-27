const mongoose = require('mongoose');
const Theater = require('./theaterModel');

const Schema = mongoose.Schema;

const showtimeSchema = new Schema({
    cinema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cinema',
    },
    theater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        require: true,
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        require: true,
    },
    startTime: {
        type: Date,
        require: true,
    },
    availableSeatsLeft: {
        type: Number,
        min: [0, 'All seats are taken'],
    },
    seats: [{ row: Number, column: Number, taken: Boolean }],
    price: {
        type: Number,
        require: true,
    },
});

showtimeSchema.index({ theater: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
