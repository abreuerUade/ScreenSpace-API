const router = require('express').Router();
const bookingController = require('../../controllers/bookingController');
const { restrictTo } = require('../../middleware/restrictRole');
const requireUser = require('../../middleware/requireUser');

router.use(requireUser, restrictTo('user'));

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
