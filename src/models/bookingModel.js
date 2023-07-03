const mongoose = require('mongoose');
const crypto = require('crypto');
const Showtime = require('../models/showtimeModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    showtime: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime',
        require: true,
        autopopulate: false,
    },
    seats: [{ row: Number, column: Number }],
    total: Number,
    bookingCode: {
        type: String,
        require: true,
        default: crypto.randomBytes(4).toString('hex'),
        select: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
});

bookingSchema.pre(/^find/, async function (next) {
    // find all bookings foa user with showtime grater than now
});

bookingSchema.pre('save', async function (next) {
    // ver asientos disponibles
    const showtime = await Showtime.findById(this.showtime);
    const seats = showtime.seats.filter(seat => {
        return seat.taken === true;
    });
    console.log(seats);
    this.seats.forEach(item => {
        if (
            seats.find(
                seat => seat.row === item.row && seat.column === item.column
            )
        ) {
            return next(new AppError('Seat not available', 400));
        }
    });

    // Calcular precio
    const bookings = await this.populate('showtime');
    this.total = bookings.showtime.price * bookings.seats.length;
});

bookingSchema.post('save', async function (doc, next) {
    // Modificar asientos disponilbes en funcion
    const showtime = await Showtime.findById(doc.showtime);
    showtime.availableSeatsLeft =
        showtime.availableSeatsLeft - doc.seats.length;
    doc.seats.forEach(item => {
        let seat = showtime.seats.find(
            i => i.row === item.row && i.column === item.column
        );
        seat.taken = true;
    });

    await showtime.save({ validateBeforeSave: true });

    const user = await User.findById(doc.user);
    const bookings = [...user.bookings, this.id];
    user.bookings = bookings;
    await user.save({ validateBeforeSave: false });
});

bookingSchema.post(/elete$/, async function (doc, next) {
    const showtime = await Showtime.findById(doc.showtime);
    showtime.availableSeatsLeft =
        showtime.availableSeatsLeft + doc.seats.length;
    doc.seats.forEach(item => {
        let seat = showtime.seats.find(
            i => i.row === item.row && i.column === item.column
        );
        seat.taken = false;
    });

    await showtime.save({ validateBeforeSave: true });
});

module.exports = mongoose.model('Booking', bookingSchema);
