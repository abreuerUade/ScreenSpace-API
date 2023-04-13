const router = require('express').Router();
const bookingController = require('../../controllers/bookingController');

router
    .route('/')
    .post(bookingController.createBooking)
    .get(bookingController.getAllBookings);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;
