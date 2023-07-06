const factory = require('../controllers/handlerFactory');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

const createBooking = catchAsync(async (req, res, next) => {
    req.body = { ...req.body, user: res.locals.user.id };

    const booking = await Booking.create(req.body);
    // console.log(booking);
    await new Email(res.locals.user, booking).sendBookingConfirmation();

    res.status(201).json({
        status: 'success',
        data: booking,
    });
});
const showtimeDate = new Date().setHours(new Date().getHours() - 3);
const getAllBookings = catchAsync(async (req, res, next) => {
    const allBookings = await Booking.find({
        user: res.locals.user.id,
    }).populate({
        path: 'showtime',
        select: '-seats -__v',
        populate: {
            path: 'movie theater cinema',
        },
    });

    const bookings = allBookings.filter(booking => {
        return (
            Date.parse(booking.showtime.startTime) >
            new Date().setHours(new Date().getHours() - 3)
        );
    });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: bookings,
    });
});

const getBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findOne({
        user: res.locals.user.id,
        _id: req.params.id,
    }).populate({
        path: 'showtime',
        select: '-seats -__v',
    });

    res.status(200).json({
        status: 'success',
        data: booking,
    });
});

const updateBooking = factory.updateOne(Booking);

const deleteBooking = factory.deleteOne(Booking);

module.exports = {
    createBooking,
    getAllBookings,
    getBooking,
    updateBooking,
    deleteBooking,
};
