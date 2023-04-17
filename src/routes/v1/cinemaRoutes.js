const router = require('express').Router();
const cinemaController = require('../../controllers/cinemaController');
const theaterController = require('../../controllers/theaterController');
const showtimeController = require('../../controllers/showtimeController');
const movieController = require('../../controllers/movieController');
const { restrictTo } = require('../../middleware/restrictRole');
const requireUser = require('../../middleware/requireUser');

router.use(requireUser);

router
    .route('/')
    .get(cinemaController.getAllCinemas)
    .post(restrictTo('owner'), cinemaController.postCinema);

router.get(
    '/cinemas-within/distance/:distance/latlng/:latlng',
    restrictTo('user'),
    cinemaController.getCinemasInRadius
);

router.get(
    '/:cinemaId/movies/:movieId/showtimes',
    restrictTo('user'),
    showtimeController.cinemaMovieShowtimes
);

router.get(
    '/:cinemaId/movies',
    restrictTo('user'),
    movieController.getMovieByCinema
);

router.use(restrictTo('owner'));

router
    .route('/:id')
    .get(cinemaController.getCinema)
    .patch(
        cinemaController.uploadCinemaPhoto,
        cinemaController.resizeCinemaPhoto,
        cinemaController.updateCinema
    )
    .delete(cinemaController.deleteCinema);

router.get('/:id/theaters', theaterController.getCinemaTheaters);

module.exports = router;
