const router = require('express').Router();
const userAuthController = require('../../auth/userAuthController');
const userController = require('../../controllers/userController');
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

module.exports = router;
