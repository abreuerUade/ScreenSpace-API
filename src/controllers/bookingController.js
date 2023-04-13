const factory = require('../controllers/handlerFactory');
const Booking = require('../models/bookingModel');

const createBooking = factory.createOne(Booking);

const getAllBookings = factory.getAll(Booking, 'showtime');

const getBooking = factory.getOne(Booking, 'showtime');

const updateBooking = factory.updateOne(Booking);

const deleteBooking = factory.deleteOne(Booking);

module.exports = {
    createBooking,
    getAllBookings,
    getBooking,
    updateBooking,
    deleteBooking,
};
