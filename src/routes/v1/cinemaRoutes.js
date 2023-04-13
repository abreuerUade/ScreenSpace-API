const router = require('express').Router();
const cinemaController = require('../../controllers/cinemaController');
const theaterController = require('../../controllers/theaterController');
const showtimeController = require('../../controllers/showtimeController');
const movieController = require('../../controllers/movieController');
const requireUser = require('../../middleware/requireUser');

router.use(requireUser);

router
    .route('/')
    .get(cinemaController.getAllCinemas)
    .post(cinemaController.postCinema);

router
    .route('/:id')
    .get(cinemaController.getCinema)
    .patch(
        cinemaController.uploadCinemaPhoto,
        cinemaController.resizeCinemaPhoto,
        cinemaController.updateCinema
    )
    .delete(cinemaController.deleteCinema);

router.get(
    '/cinemas-within/distance/:distance/latlng/:latlng',
    cinemaController.getCinemasInRadius
);

router.get('/:id/theaters', theaterController.getCinemaTheaters);

router.get(
    '/:cinemaId/movies/:movieId/showtimes',
    showtimeController.cinemaMovieShowtimes
);

router.get('/:cinemaId/movies', movieController.getMovieByCinema);

module.exports = router;
