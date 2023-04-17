const mongoose = require('mongoose');
const Showtime = require('../models/showtimeModel');
const User = require('../models/userModel');

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
    active: {
        type: Boolean,
        default: true,
    },
});

bookingSchema.pre(/^find/, async function (next) {
    console.log(this);
    this.find({
        active: { $ne: false },
    });
});

bookingSchema.pre('save', async function (next) {
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

module.exports = mongoose.model('Booking', bookingSchema);
