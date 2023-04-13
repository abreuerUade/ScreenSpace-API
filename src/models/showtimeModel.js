const mongoose = require('mongoose');
const Theater = require('../models/theaterModel');

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
    },
    seats: [{ row: Number, column: Number, taken: Boolean }],
    price: {
        type: Number,
        require: true,
    },
});

showtimeSchema.index({ theater: 1, startTime: 1 }, { unique: true });

showtimeSchema.pre('save', async function (next) {
    const theater = await Theater.findById(this.theater).populate({
        path: 'cinema',
    });

    const rows = theater.numberOfRows;
    const cols = theater.numberOfCols;
    this.cinema = theater.cinema;
    console.log(this.startTime);
    this.startTime = new Date(this.startTime);
    if (this.seats.length === 0) {
        this.availableSeatsLeft = rows * cols;
        for (let r = 1; r <= rows; r++) {
            for (let c = 1; c <= cols; c++) {
                this.seats.push({ row: r, column: c, taken: false });
            }
        }
    }
});

module.exports = mongoose.model('Showtime', showtimeSchema);
