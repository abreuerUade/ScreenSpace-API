const router = require('express').Router();
const ratingController = require('../../controllers/ratingController');
const { restrictTo } = require('../../middleware/restrictRole');
const requireUser = require('../../middleware/requireUser');

router.use(requireUser, restrictTo('user'));

router.post('/', ratingController.rateMovie);

module.exports = router;
