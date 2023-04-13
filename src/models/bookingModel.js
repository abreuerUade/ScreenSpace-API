const mongoose = require('mongoose');
const Showtime = require('../models/showtimeModel');
const { forEach } = require('lodash');

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
    },
    seats: [{ row: Number, column: Number, taken: Boolean }],
    total: Number,
    active: {
        type: Boolean,
        default: true,
    },
});

bookingSchema.post(/^find/, async function (next) {
    const now = new Date();
    this.find({
        active: { $ne: false },
        'showtime.startTime': { $gt: now },
    }).select();

    console.log(now);
});

bookingSchema.pre('save', async function (next) {
    // Calcular precio
    const bookings = await this.populate('showtime');
    console.log(bookings.showtime.price);
    this.total = bookings.showtime.price * bookings.seats.length;
});

bookingSchema.post('save', async function (doc, next) {
    // Modificar asientos disponilbes en funcion
    const showtime = await Showtime.findById(doc.showtime);
    console.log(doc.seats.length);
    showtime.availableSeatsLeft =
        showtime.availableSeatsLeft - doc.seats.length;
    doc.seats.forEach(item => {
        let seat = showtime.seats.find(
            i => i.row === item.row && i.column === item.column
        );
        seat.taken = true;
    });

    await showtime.save({ validateBeforeSave: false });
});

module.exports = mongoose.model('Booking', bookingSchema);
