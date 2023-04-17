const router = require('express').Router();
const theaterController = require('../../controllers/theaterController');
const requireUser = require('../../middleware/requireUser');
const { restrictTo } = require('../../middleware/restrictRole');

router.use(requireUser);

router.post('/', restrictTo('owner'), theaterController.createTheater);

router
    .route('/:id')
    .get(theaterController.getTheater)
    .patch(restrictTo('owner'), theaterController.updateTheater)
    .delete(restrictTo('owner'), theaterController.deleteTheater);

module.exports = router;
