const router = require('express').Router();
const showtimeController = require('../../controllers/showtimeController');

router
    .route('/')
    .post(showtimeController.createShowtime)
    .get(showtimeController.getAllShowtimes);

router
    .route('/:id')
    .patch(showtimeController.updateShowtime)
    .get(showtimeController.getShowtime)
    .delete(showtimeController.deleteShowtime);

module.exports = router;
