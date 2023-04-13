const router = require('express').Router();
const ownerController = require('../../controllers/ownerController');
const cinemaController = require('../../controllers/cinemaController');
const ownerAuthController = require('../../auth/ownerAuthController');
const requireUser = require('../../middleware/requireUser');

router.post('/', ownerAuthController.signup);

router.get('/confirmedEmail/:token', ownerAuthController.verifyEmail);

router.post('/auth', ownerAuthController.login);

router.post('/forgotPassword', ownerAuthController.forgotPassword);
router.patch('/resetPassword/:token', ownerAuthController.resetPassword);

router.use(requireUser);

router.delete('/auth', ownerAuthController.logout);

router.patch('/password', ownerAuthController.updatePassword);

router.get('/', ownerController.getMe, ownerController.getOwner);

router.patch(
    '/',
    ownerController.uploadOwnerPhoto,
    ownerController.resizeOwnerPhoto,
    ownerController.updateMe
);

router.delete('/', ownerController.deleteMe);

router.get('/:ownerId/cinemas', cinemaController.getOwnerCinemas);

module.exports = router;
