const router = require('express').Router();
const movieController = require('../../controllers/movieController');
const ratingController = require('../../controllers/ratingController');
const requireUser = require('../../middleware/requireUser');
const { restrictTo } = require('../../middleware/restrictRole');

router.use(requireUser);

router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getOneMovie);

router.get(
    '/:id/ratings',
    restrictTo('user'),
    ratingController.getMovieRatings
);

module.exports = router;
