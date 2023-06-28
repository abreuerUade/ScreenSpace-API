const router = require('express').Router();
const userAuthController = require('../../auth/userAuthController');
const userController = require('../../controllers/userController');
const ratingController = require('../../controllers/ratingController');
const requireUser = require('../../middleware/requireUser');
const { restrictTo } = require('../../middleware/restrictRole');

router.post('/auth', userAuthController.login);

router.use(requireUser, restrictTo('user'));

router.delete('/auth', userAuthController.logout);

router
    .route('/')
    .get(userController.getMe, userController.getUser)
    .patch(
        userController.uploadUserPhoto,
        userController.resizeUserPhoto,
        userController.updateMe
    )
    .delete(userController.deleteMe);

router.get('/:id/ratings', ratingController.getUserRatings);

module.exports = router;
