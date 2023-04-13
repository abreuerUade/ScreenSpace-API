const router = require('express').Router();
const theaterController = require('../../controllers/theaterController');
const requireUser = require('../../middleware/requireUser');

router.use(requireUser);

router.post('/', theaterController.createTheater);

router
    .route('/:id')
    .get(theaterController.getTheater)
    .patch(theaterController.updateTheater)
    .delete(theaterController.deleteTheater);

module.exports = router;
