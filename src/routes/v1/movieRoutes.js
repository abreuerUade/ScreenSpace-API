const router = require('express').Router();
const movieController = require('../../controllers/movieController');
const requireUser = require('../../middleware/requireUser');

router.use(requireUser);

router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getOneMovie);

module.exports = router;
