const router = require('express').Router();
const showtimeController = require('../../controllers/showtimeController');
const { restrictTo } = require('../../middleware/restrictRole');
const requireUser = require('../../middleware/requireUser');

router.use(requireUser);

router
    .route('/')
    .post(restrictTo('owner'), showtimeController.createShowtime)
    .get(showtimeController.getAllShowtimes);

router
    .route('/:id')
    .patch(restrictTo('owner'), showtimeController.updateShowtime)
    .get(showtimeController.getShowtime)
    .delete(restrictTo('owner'), showtimeController.deleteShowtime);

module.exports = router;
